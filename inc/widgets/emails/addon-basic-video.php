<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class BasicVideo {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-video';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $contentFields = $element['data']['content']['video'] ?? [];
        $styleFields = $element['data']['style']['videoStyle'] ?? [];
        $advancedFields = $element['data']['advanced']['videoAdvanced'] ?? [];

        $get = function($fields, $id, $default = '') {
            foreach ($fields as $f) {
                if (isset($f['id']) && $f['id'] === $id) {
                    return $f['value'] ?? $default;
                }
            }
            return $default;
        };

        $getBool = function($fields, $id, $default = false) use ($get) {
            $val = $get($fields, $id, $default);
            return $val === true || $val === 'true';
        };

        $sourceType = $get($contentFields, 'sourceType', 'youtube');
        $youtubeUrl = $get($contentFields, 'youtubeUrl', '');
        $videoUrl = $get($contentFields, 'videoUrl', '');
        $embedCode = $get($contentFields, 'embedCode', '');

        $autoplay = $getBool($advancedFields, 'autoplay', false);
        $loop = $getBool($advancedFields, 'loop', false);
        $muted = $getBool($advancedFields, 'muted', false);
        $controls = $getBool($advancedFields, 'controls', true);

        $aspectRatio = $get($styleFields, 'aspectRatio', '16:9');
        $borderRadius = $get($styleFields, 'borderRadius', '0px');
        $boxShadow = $get($styleFields, 'boxShadow', '');

        $aspectMap = [
            '16:9' => '56.25%',
            '4:3' => '75%',
            '21:9' => '42.85%',
            '1:1' => '100%'
        ];
        $paddingBottom = $aspectMap[$aspectRatio] ?? '56.25%';

        $wrapperStyle = 'position:relative;width:100%;padding-bottom:' . esc_attr($paddingBottom) . ';border-radius:' . esc_attr($borderRadius) . ';overflow:hidden;';
        if (!empty($boxShadow)) {
            $wrapperStyle .= 'box-shadow:' . esc_attr($boxShadow) . ';';
        }

        $iframeStyle = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';

        if ($sourceType === 'youtube' && !empty($youtubeUrl)) {
            $videoId = '';
            if (preg_match('/v=([^&]+)/', $youtubeUrl, $matches)) {
                $videoId = $matches[1];
            } elseif (preg_match('/youtu\.be\/([^?]+)/', $youtubeUrl, $matches)) {
                $videoId = $matches[1];
            } elseif (preg_match('/youtube\.com\/embed\/([^?]+)/', $youtubeUrl, $matches)) {
                $videoId = $matches[1];
            }

            if (!empty($videoId)) {
                $embedUrl = 'https://www.youtube.com/embed/' . esc_attr($videoId)
                    . '?autoplay=' . ($autoplay ? '1' : '0')
                    . '&loop=' . ($loop ? '1' : '0')
                    . '&mute=' . ($muted ? '1' : '0')
                    . '&controls=' . ($controls ? '1' : '0');

                return '<div style="' . $wrapperStyle . '"><iframe style="' . $iframeStyle . '" src="' . $embedUrl . '" allow="autoplay; encrypted-media" allowfullscreen title="YouTube Video"></iframe></div>';
            }
        }

        if ($sourceType === 'url' && !empty($videoUrl)) {
            $autoplayAttr = $autoplay ? ' autoplay' : '';
            $loopAttr = $loop ? ' loop' : '';
            $mutedAttr = $muted ? ' muted' : '';
            $controlsAttr = $controls ? ' controls' : '';
            return '<div style="' . $wrapperStyle . '"><video src="' . esc_url($videoUrl) . '" style="' . $iframeStyle . '"' . $controlsAttr . $autoplayAttr . $loopAttr . $mutedAttr . ' playsinline></video></div>';
        }

        if ($sourceType === 'embed' && !empty($embedCode)) {
            return '<div style="' . $wrapperStyle . '">' . $embedCode . '</div>';
        }

        return '<div style="padding:20px;color:#999;font-style:italic;border:2px dashed #ddd;border-radius:4px;text-align:center;">Please provide a valid video source</div>';
    }
}
