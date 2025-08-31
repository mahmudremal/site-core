Below is a concise, end-to-end plan you can implement for a custom WordPress e-commerce plugin that personalizes the header and product listings based on user interests/behavior—without WooCommerce.

# 0) Outcomes & Signals

* **Goals:** CTR to PDP, Add-to-Cart rate, Revenue/Session.
* **Events:** `view_item`, `view_category`, `search`, `add_to_cart`, `purchase`, `time_on_page`, `scroll_depth`, `campaign_ref`.
* **Identity:** anonymous first-party cookie `reco_uid`; bind to `user_id` on login; 30-min sessionization.

# 1) DB Schema (MySQL/InnoDB)

```sql
-- Events (append-only, partition by day or month)
CREATE TABLE wp_reco_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  occurred_at DATETIME NOT NULL,
  session_id CHAR(36) NOT NULL,
  user_key VARBINARY(36) NOT NULL,                -- anon uuid or user_id:N
  user_id BIGINT UNSIGNED NULL,                   -- if logged in
  event_type VARCHAR(32) NOT NULL,                -- view_item, add_to_cart, ...
  item_id BIGINT UNSIGNED NULL,
  category_id BIGINT UNSIGNED NULL,
  meta JSON NULL,                                 -- utm, referrer, price, device
  ip VARBINARY(16) NULL,
  ua VARCHAR(255) NULL,
  KEY k_user_time (user_key, occurred_at),
  KEY k_item_time (item_id, occurred_at),
  KEY k_type_time (event_type, occurred_at),
  KEY k_session (session_id)
) ENGINE=InnoDB;

-- Item catalog features (attributes for content-based)
CREATE TABLE wp_reco_item_meta (
  item_id BIGINT UNSIGNED PRIMARY KEY,
  title VARCHAR(255), brand VARCHAR(128),
  categories JSON, tags JSON, price DECIMAL(10,2),
  availability TINYINT, created_at DATETIME,
  updated_at DATETIME,
  FULLTEXT KEY ft_title (title) -- if MySQL supports InnoDB FTS
) ENGINE=InnoDB;

-- Precomputed item→item similarities (top-N per item)
CREATE TABLE wp_reco_item_sim (
  item_id BIGINT UNSIGNED NOT NULL,
  sim_item_id BIGINT UNSIGNED NOT NULL,
  score FLOAT NOT NULL,                           -- 0..1
  PRIMARY KEY (item_id, sim_item_id),
  KEY k_simitem (sim_item_id)
) ENGINE=InnoDB;

-- Optional nightly user embeddings / top-N
CREATE TABLE wp_reco_user_topn (
  user_key VARBINARY(36) NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  score FLOAT NOT NULL,
  PRIMARY KEY (user_key, item_id)
) ENGINE=InnoDB;

-- Per-user interest profile (decayed)
CREATE TABLE wp_reco_user_interest (
  user_key VARBINARY(36) NOT NULL,
  taxonomy VARCHAR(32) NOT NULL,                  -- category, brand, tag
  term_id BIGINT UNSIGNED NOT NULL,
  weight FLOAT NOT NULL,
  PRIMARY KEY (user_key, taxonomy, term_id),
  KEY k_user (user_key)
) ENGINE=InnoDB;

-- Experiments
CREATE TABLE wp_reco_experiments (
  experiment_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128), created_at DATETIME
) ENGINE=InnoDB;

CREATE TABLE wp_reco_experiment_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  experiment_id VARCHAR(32) NOT NULL,
  variant TINYINT NOT NULL,       -- 0/1/2...
  user_key VARBINARY(36) NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  value DOUBLE NULL,
  occurred_at DATETIME NOT NULL,
  KEY k_exp (experiment_id, variant),
  KEY k_user (user_key, occurred_at)
) ENGINE=InnoDB;
```

# 2) WP Plugin Skeleton (key pieces)

**Plugin bootstrap**

```php
<?php
/**
 * Plugin Name: Custom Reco
 * Description: Behavior tracking + personalization (header + listings).
 */

register_activation_hook(__FILE__, 'reco_install'); // run CREATE TABLEs

add_action('rest_api_init', function () {
  register_rest_route('reco/v1', '/event', [
    'methods'  => 'POST',
    'callback' => 'reco_ingest_event',
    'permission_callback' => '__return_true'
  ]);
});

function reco_uid() {
  if (!isset($_COOKIE['reco_uid'])) {
    $uid = wp_generate_uuid4();
    setcookie('reco_uid', $uid, time()+31536000, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true);
    $_COOKIE['reco_uid'] = $uid;
  }
  return $_COOKIE['reco_uid'];
}

function reco_ingest_event(\WP_REST_Request $r) {
  global $wpdb;
  $payload = $r->get_json_params();
  $uid = reco_uid();
  $session = $payload['session_id'] ?? $uid; // supply from client
  $type = sanitize_text_field($payload['event_type']);
  $item = isset($payload['item_id']) ? intval($payload['item_id']) : null;
  $cat  = isset($payload['category_id']) ? intval($payload['category_id']) : null;
  $meta = wp_json_encode($payload['meta'] ?? []);
  $wpdb->query($wpdb->prepare(
    "INSERT INTO wp_reco_events (occurred_at, session_id, user_key, user_id, event_type, item_id, category_id, meta, ip, ua)
     VALUES (UTC_TIMESTAMP(), %s, %s, %d, %s, %d, %d, %s, %s, %s)",
     $session, $uid, get_current_user_id() ?: null, $type, $item, $cat, $meta,
     inet_pton($_SERVER['REMOTE_ADDR']), substr($_SERVER['HTTP_USER_AGENT'] ?? '',0,255)
  ));
  // realtime interest update (decayed counts)
  if ($cat) reco_update_interest($uid, 'category', $cat, $type);
  return new \WP_REST_Response(['ok' => true], 200);
}
```

**Client tracker (enqueue once site-wide)**

```php
add_action('wp_enqueue_scripts', function() {
  wp_register_script('reco-js', plugins_url('reco.js', __FILE__), [], null, true);
  wp_localize_script('reco-js', 'RECO_CFG', [
    'endpoint' => rest_url('reco/v1/event'),
    'uid' => $_COOKIE['reco_uid'] ?? ''
  ]);
  wp_enqueue_script('reco-js');
});
```

**`reco.js` (minimal)**

```js
(function(){
  const uid = (document.cookie.match(/reco_uid=([^;]+)/)||[])[1];
  const sid = sessionStorage.getItem('reco_sid') || crypto.randomUUID();
  sessionStorage.setItem('reco_sid', sid);

  function send(event){ navigator.sendBeacon(RECO_CFG.endpoint, new Blob([JSON.stringify(event)], {type:'application/json'})); }

  // page view
  const meta = {url:location.href, ref:document.referrer, utm:Object.fromEntries(new URLSearchParams(location.search))};
  send({session_id:sid, event_type:'view_page', meta});

  // product or category contexts (render data-* attributes server-side)
  document.querySelectorAll('[data-reco-item]').forEach(el=>{
    send({session_id:sid, event_type:'view_item', item_id:parseInt(el.dataset.recoItem), meta});
  });
  document.querySelectorAll('[data-reco-category]').forEach(el=>{
    send({session_id:sid, event_type:'view_category', category_id:parseInt(el.dataset.recoCategory), meta});
  });

  // add-to-cart hooks
  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-reco-add]');
    if(!btn) return;
    send({session_id:sid, event_type:'add_to_cart', item_id:parseInt(btn.dataset.recoAdd)});
  });
})();
```

# 3) Real-Time Interest Profile (header personalization)

* Maintain decayed weights per user and taxonomy. Exponential decay with half-life **H** hours.

**Server update**

```php
function reco_update_interest($user_key, $tax, $term_id, $event_type){
  global $wpdb;
  $w = in_array($event_type, ['add_to_cart','purchase']) ? 3.0 : ($event_type==='view_item' ? 1.0 : 0.3);
  // decay existing weight
  $wpdb->query($wpdb->prepare("
    INSERT INTO wp_reco_user_interest (user_key,taxonomy,term_id,weight)
    VALUES (%s,%s,%d,%f)
    ON DUPLICATE KEY UPDATE weight = weight * EXP(-GREATEST(TIMESTAMPDIFF(SECOND, NOW(), NOW()),0) / (3600*24)) + VALUES(weight)
  ", $user_key,$tax,$term_id,$w));
}
```

**Header generator**

```php
function reco_user_top_terms($user_key, $tax='category', $k=4){
  global $wpdb;
  $rows = $wpdb->get_results($wpdb->prepare("
    SELECT term_id, weight FROM wp_reco_user_interest
    WHERE user_key=%s AND taxonomy=%s
    ORDER BY weight DESC LIMIT %d
  ", $user_key,$tax,$k));
  if (!$rows || empty($rows)) {
    // fallback: trending by campaign ref or sitewide top categories
    return reco_trending_categories($k);
  }
  return array_map(fn($r)=>intval($r->term_id), $rows);
}

// In your header template:
$topCats = reco_user_top_terms(reco_uid(), 'category', 4);
wp_nav_menu(['menu' => 'Dynamic Root', 'fallback_cb'=>function() use ($topCats) {
  echo '<ul class="nav">';
  foreach ($topCats as $term_id) {
    echo '<li><a href="'.get_term_link($term_id).'">'.get_term($term_id)->name.'</a></li>';
  }
  echo '</ul>';
}]);
```

# 4) Candidate Generation (server)

Use a hybrid of:

* **Contextual cold-start:** page context (same category), campaign UTM, sitewide trending.
* **Session-based:** last N viewed items → union of top-M similar items from `wp_reco_item_sim`.
* **User interest:** categories/brands with highest decayed weights → top sellers there.
* **Exclusions:** out of stock, already purchased, low margin (if desired).

```php
function reco_candidates($ctx){
  global $wpdb;
  $uids = reco_uid();
  $recent = $wpdb->get_col($wpdb->prepare("
    SELECT item_id FROM wp_reco_events WHERE user_key=%s AND item_id IS NOT NULL
    ORDER BY occurred_at DESC LIMIT 5
  ", $uids));

  $sim = [];
  foreach ($recent as $it) {
    $rows = $wpdb->get_results($wpdb->prepare("
      SELECT sim_item_id, score FROM wp_reco_item_sim
      WHERE item_id=%d ORDER BY score DESC LIMIT 50", $it));
    foreach ($rows as $r) { $sim[$r->sim_item_id] = max($sim[$r->sim_item_id] ?? 0, (float)$r->score); }
  }

  if (empty($sim) && !empty($ctx['category_id'])) {
    // fallback: top items in this category
    $rows = $wpdb->get_col($wpdb->prepare("
      SELECT item_id FROM wp_reco_item_meta /* ideally a materialized 'top' table */
      WHERE JSON_CONTAINS(categories, JSON_QUOTE(%d)) LIMIT 100", $ctx['category_id']));
    foreach ($rows as $id) $sim[$id] = 0.2;
  }
  return $sim; // item_id => base similarity score
}
```

# 5) Ranking Function (fusion scoring)

Deterministic, fast, tunable weights:

```
score(i,u,c) = 
  0.50 * sim_recent(i)                -- from candidates map
+ 0.20 * interest_match(i,u)          -- overlap with user top categories/brands
+ 0.10 * popularity(i,c)              -- CTR/add-to-cart in last 7d, category-aware
+ 0.08 * freshness(i)                 -- newer items slightly boosted
+ 0.07 * margin(i)                    -- optional business control
+ 0.05 * availability(i)              -- in-stock > low-stock > OOS
```

All components normalized to \[0,1]. Cache per `(user_key, context_key)` for 5–10 minutes.

**Applying to listings (hook)**

```php
add_action('pre_get_posts', function($q){
  if (is_admin() || !$q->is_main_query() || !is_post_type_archive('product')) return;
  $ctx = ['category_id' => get_queried_object_id() ?: null];
  $cands = reco_candidates($ctx);
  if (!$cands) return;

  // Create a temporary scores table for this request (or use Redis); here we use FIELD() for simplicity
  $ids = implode(',', array_map('intval', array_keys($cands)));
  $q->set('post__in', array_keys($cands));
  $q->set('orderby', 'post__in'); // order by our custom sequence
});
```

# 6) Offline Modeling (nightly job; Python microservice or CLI)

* **Data export:** `SELECT * FROM wp_reco_events WHERE occurred_at >= NOW() - INTERVAL 30 DAY`.
* **Item-item similarity:** co-occurrence in sessions (`view_item` & `add_to_cart`), cosine/Jaccard; or hybrid with content features (brand, category, tags) using TF-IDF. Optionally train LightFM/Matrix Factorization to generate embeddings; then compute top-K neighbors per item.
* **Write back:** upsert `wp_reco_item_sim` with top 200 neighbors/item.
* **Optional:** write `wp_reco_user_topn` for warm users.

Pseudo-steps:

1. Build sessions; for each session, collect ordered item IDs.
2. Count co-occurrence pairs within a sliding window (e.g., ±3).
3. Compute PMI or cosine; normalize to 0..1.
4. Merge with content similarity (weighted average).
5. Persist top-K.

# 7) Real-Time Infrastructure

* **Caching:** Redis for:

  * `sim:{item_id}` → ZSET of similar items.
  * `trend:{cat}` → ZSET top items past 7d.
  * `u:interest:{uid}` → hash of term→weight.
* **Writes:** buffer events via `sendBeacon`; ingest endpoint does single-row INSERT; consider batching to a queue for extreme traffic.
* **Indexes:** as in schema; consider monthly partitions for `wp_reco_events`.

# 8) A/B Testing (built-in)

* **Bucketing:** `$bucket = crc32($uid.$experiment_id) % 100;` map to variant.
* **Log:** add `experiment_id`, `variant` to every `reco_event` (or separate table).
* **Readout:** compute CTR, ATC rate, RPS per variant; stop on significance.

# 9) Privacy & Consent

* First-party cookie only; honor consent. Defer firing until consent or store locally and backfill.
* Provide “Personalization off” toggle that clears `reco_uid` and bypasses personalization.

# 10) Deployment Order (practical)

1. **Week 1**

   * Plugin scaffolding, tables, REST endpoint, JS tracker.
   * Dynamic header using decayed category interests.
   * Contextual/trending recommendations on PDP & category pages.
2. **Week 2**

   * Item-item similarity offline job + cron to refresh nightly.
   * Ranking function + caching.
   * A/B test framework and metric dashboards.
3. **Week 3+**

   * Add brand/tag interests, margin/stock signals, campaign-aware cold start, and user-embedding top-N.

# 11) Minimal Queries You’ll Need

**Trending by category (7d)**

```sql
SELECT item_id, COUNT(*) as views
FROM wp_reco_events
WHERE event_type='view_item' AND occurred_at >= NOW() - INTERVAL 7 DAY
  AND item_id IN (SELECT item_id FROM wp_reco_item_meta WHERE JSON_CONTAINS(categories, JSON_QUOTE(?)))
GROUP BY item_id ORDER BY views DESC LIMIT 100;
```

**Build co-occurrence (offline)**

```sql
-- export sessions:
SELECT session_id, occurred_at, item_id
FROM wp_reco_events
WHERE event_type IN ('view_item','add_to_cart')
  AND occurred_at >= NOW() - INTERVAL 30 DAY
  AND item_id IS NOT NULL
ORDER BY session_id, occurred_at;
```

# 12) Hooks to Place in Theme/Templates

* Add `data-reco-item` on product detail and cards; `data-reco-category` on category pages.
* Wrap “Add to cart” buttons with `data-reco-add`.
* Replace static header menu with the dynamic list from `reco_user_top_terms()`.

---

If you want, I can turn this into a ready-to-install starter plugin (files + SQL + a small Python script to build `wp_reco_item_sim`) with sane defaults and TODOs for you to fill.
