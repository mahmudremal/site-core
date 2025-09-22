<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Redis {
	use Singleton;

	private $client;

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_filter('sitecore/redis/get', [$this, 'redis_get'], 10, 2);
		add_filter('sitecore/redis/set', [$this, 'redis_set'], 10, 3);
		add_filter('sitecore/redis/delete', [$this, 'redis_delete'], 10, 1);
		add_filter('sitecore/redis/exists', [$this, 'redis_exists'], 10, 1);
	}

	private function initRedis() {
		if ($this->client) return true;
		if (!file_exists(__DIR__ . '/../../vendor/autoload.php')) return false;
		require_once __DIR__ . '/../../vendor/autoload.php';
		if (!class_exists('\Predis\Client')) return false;
		$this->client = new \Predis\Client([
			'host'   => '127.0.0.1',
			'scheme' => 'tcp',
			'port'   => 6379,
		]);
		return true;
	}

	public function redis_get($key, $default = false) {
		if (!$this->initRedis()) return $default;
		try {
			$value = $this->client->get($key);
			return $value !== null ? maybe_unserialize($value) : $default;
		} catch (\Exception $e) {
			return $default;
		}
	}

	public function redis_set($key, $value, $ttl = 0) {
		if (!$this->initRedis()) return false;
		try {
			$value = maybe_serialize($value);
			if ($ttl > 0) {
				$this->client->setex($key, $ttl, $value);
			} else {
				$this->client->set($key, $value);
			}
			return true;
		} catch (\Exception $e) {
			return false;
		}
	}

	public function redis_delete($key) {
		if (!$this->initRedis()) return false;
		try {
			$this->client->del([$key]);
			return true;
		} catch (\Exception $e) {
			return false;
		}
	}

	public function redis_exists($key) {
		if (!$this->initRedis()) return false;
		try {
			return $this->client->exists($key) > 0;
		} catch (\Exception $e) {
			return false;
		}
	}
}
