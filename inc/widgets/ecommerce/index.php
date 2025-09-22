<?php
namespace SITE_CORE\inc\Ecommerce;
use SITE_CORE\inc\Traits\Singleton;

class Addons {
    use Singleton;

    protected function __construct() {
        $this->setup_addons();
    }

    protected function setup_addons() {
        $addon_files = glob(__DIR__ . '/addon-*.php');
        if (empty($addon_files)) {return;}
        foreach ($addon_files as $i => $file) {
            require_once $file;
            $class_name = $this->get_class_name_from_file($file);
            if (class_exists($class_name)) {
                call_user_func([$class_name, 'get_instance']);
            }
        }
    }
    
    protected function get_class_name_from_file($file_path) {
        $filename = basename($file_path, '.php');
        $parts = explode('-', $filename);
        array_shift($parts);
        $class_suffix = implode('', array_map('ucfirst', $parts));
        return 'SITE_CORE\\inc\\Ecommerce\\Addons\\' . $class_suffix;
    }
}
