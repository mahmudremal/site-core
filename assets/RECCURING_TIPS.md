You're correct — Tap Payments **does not offer a native recurring subscription billing system** like Stripe does. However, **recurring payments can still be implemented manually** using the `save_card: true` functionality and Tap's **Payment Agreement (UNSCHEDULED)** system, as your response shows.

### ✅ What You Already Have

From the response you posted:

* The customer’s card is saved (`save_card: 1`)
* A `payment_agreement` is created:

  ```php
  [payment_agreement] => Array
    (
        [id] => payment_agreement_CKJD4725120bVla12mA4P749
        [type] => UNSCHEDULED
        ...
    )
  ```

This means you now have **authorization** to initiate future payments on behalf of this customer without requiring re-authentication (e.g., 3D Secure), which is exactly what Tap's "unscheduled agreement" is designed for.

---

### ✅ How to Use This for Recurring Payments

You can initiate recurring charges (monthly, for example) **server-side via WordPress** using Tap’s Charge API, referencing:

* The `payment_agreement.id`
* Or the saved `card.id` + `customer.id`

#### ✅ Preferred Method: Use `payment_agreement.id`

Create a charge like this:

```json
POST https://api.tap.company/v2/charges
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json

{
  "amount": 15,
  "currency": "AED",
  "customer": {
    "id": "cus_LV07D4620251500Mt611205753"
  },
  "payment_agreement": {
    "id": "payment_agreement_CKJD4725120bVla12mA4P749"
  },
  "description": "Monthly Subscription - May",
  "metadata": {
    "subscription_month": "May 2025"
  },
  "reference": {
    "transaction": "sub_2025_05"
  }
}
```

> This works **without customer intervention**, assuming the card is still valid and 3D Secure is not required for this recurring type.

---

### 🛠️ WordPress Implementation

You can:

* **Store `payment_agreement.id`** in `user_meta` or a custom table.
* **Set a WP-Cron task** to trigger monthly.
* On each cron run, **initiate the charge** via `wp_remote_post()` using the agreement ID.
* Optionally, store the result (e.g., charge ID, status) in your DB or show it in the dashboard.

---

### 🧠 Notes

1. **Make sure the initial charge is fully 3D-Secured** and you set `save_card: true`. You already did this.
2. You must **not reuse tokens**, but reusing saved cards or agreements is valid.
3. Check with Tap Support that your account is eligible for recurring/unscheduled payments to avoid failure due to acquirer restrictions.
4. If the saved card is declined or expired, Tap will return a clear failure you can handle.

---

Would you like a sample PHP function that makes this recurring charge using stored metadata in WordPress?
