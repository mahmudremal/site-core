<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Credits {
    use Singleton;

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('wp_footer', [$this, 'add_footer_credit']);
        add_action('wp_head', [$this, 'add_developer_meta_tag']);
    }

    public function add_footer_credit() {
        ?>
        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "creator": {
                "@type": "Person",
                "name": "Remal Mahmud",
                "url": "https://www.mahmudremal.com/"
                },
                "url": "<?php echo esc_url(home_url('/')); ?>"
            }
        </script>
        <?php
    }

    public function add_developer_meta_tag() {
        echo '<meta name="developer" content="Remal Mahmud, https://www.mahmudremal.com/">';
    }
}