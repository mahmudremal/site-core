import { useEffect, useState } from 'react';
import { Smartphone, Download, Star, Shield, Zap, TrendingUp, Check, ExternalLink, Loader2, Apple, Chrome } from 'lucide-react';
import MoonlitSky from '../components/backgrounds/MoonlitSky';
import { useLocale } from '../hooks/useLocale';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import QRCode from 'react-qr-code';
import { useTheme } from '../hooks/useTheme';

const AppInstallPage = () => {
    const { __ } = useLocale();
    const { theme } = useTheme();
    const [appUrl, setAppUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState(null);

    const platformConfig = {
        ios: {
            name: 'App Store',
            icon: <Apple className="xpo_w-6 xpo_h-6" />,
            url: 'https://apps.apple.com/us/app/moonlitmeadow-shopping/id978058048',
            color: 'xpo_from-gray-900 xpo_to-gray-700',
            buttonText: 'Download on the App Store',
            description: 'Get the premium shopping experience on your iPhone or iPad',
            badge: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg'
        },
        android: {
            name: 'Google Play',
            icon: (
                <svg className="xpo_w-6 xpo_h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
            ),
            url: 'https://play.google.com/store/apps/details?id=com.moonlitmeadow.android',
            color: 'xpo_from-scprimary-600 xpo_to-scaccent-600',
            buttonText: 'Get it on Google Play',
            description: 'Experience seamless shopping on your Android device',
            badge: 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'
        },
        harmony: {
            name: 'AppGallery',
            icon: (
                <svg className="xpo_w-6 xpo_h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
            ),
            url: 'https://appgallery.huawei.com/app/C100948133',
            color: 'xpo_from-red-600 xpo_to-pink-600',
            buttonText: 'Explore it on AppGallery',
            description: 'Shop with confidence on your Huawei device',
            badge: null
        },
        chrome: {
            name: 'Chrome Web Store',
            icon: <Chrome className="xpo_w-6 xpo_h-6" />,
            url: 'https://chromewebstore.google.com/detail/moonlitmeadow-client/jdkknkkbebbapilgoeccciglkfbmbnfm',
            color: 'xpo_from-scaccent-500 xpo_to-scprimary-500',
            buttonText: 'Add to Chrome',
            description: 'Install our powerful Chrome extension for desktop shopping',
            badge: null
        }
    };

    const features = [
        {
            icon: <Shield className="xpo_w-6 xpo_h-6" />,
            title: 'Secure Payments',
            description: 'Bank-grade encryption for all transactions'
        },
        {
            icon: <Zap className="xpo_w-6 xpo_h-6" />,
            title: 'Lightning Fast',
            description: 'Optimized performance for smooth shopping'
        },
        {
            icon: <Star className="xpo_w-6 xpo_h-6" />,
            title: 'Premium Quality',
            description: 'Curated selection of top-rated products'
        },
        {
            icon: <TrendingUp className="xpo_w-6 xpo_h-6" />,
            title: 'Best Deals',
            description: 'Exclusive offers and daily discounts'
        }
    ];

    const benefits = [
    'One-tap checkout for faster purchases',
    'Real-time order tracking and notifications',
    'Personalized recommendations based on your preferences',
    'Exclusive app-only deals and discounts',
    'Secure biometric authentication',
    '24/7 customer support at your fingertips'
    ];

    useEffect(() => {
        const detectPlatform = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            
            // iOS detection
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                return 'ios';
            }
            
            // Android detection
            if (/android/i.test(userAgent)) {
                // Check for Huawei/HarmonyOS
                if (/huawei|harmony|honor/i.test(userAgent)) {
                    return 'harmony';
                }
                return 'android';
            }
            
            // Chrome browser detection (desktop)
            if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) {
                return 'chrome';
            }
            
            // Default to Android for unknown mobile devices
            if (/mobile/i.test(userAgent)) {
                return 'android';
            }
            
            // Default to Chrome for desktop
            return 'chrome';
        };
        const detected = detectPlatform();
        setPlatform(detected);
        setAppUrl(platformConfig[detected]?.url || '');
    }, []);

    
    useEffect(() => {
        const delay = setTimeout(() => {
            setLoading(false);
        }, 2500);
        return () => clearTimeout(delay);
    }, []);

    const currentPlatform = platform ? platformConfig[platform] : null;

    if (loading) {
        return (
            <div className="xpo_min-h-screen xpo_flex xpo_items-center xpo_justify-center xpo_relative xpo_z-10">
                <div className="xpo_text-center">
                    <Loader2 className="xpo_w-16 xpo_h-16 xpo_animate-spin xpo_text-scprimary-600 dark:xpo_text-scwhite-900 xpo_mx-auto xpo_mb-4" />
                    <p className="xpo_text-gray-600 dark:xpo_text-scwhite-600 xpo_text-lg">{__('Detecting your device...', 'site-core')}</p>
                </div>
            </div>
        );
    }

  return (
    <>
        <div className="xpo_absolute xpo_top-0 xpo_right-0 xpo_w-96 xpo_h-96 xpo_bg-scprimary-200 xpo_rounded-full xpo_blur-3xl xpo_opacity-20 xpo_-mr-48 xpo_-mt-48"></div>
        <div className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_w-96 xpo_h-96 xpo_bg-scaccent-200 xpo_rounded-full xpo_blur-3xl xpo_opacity-20 xpo_-ml-48 xpo_-mb-48"></div>

        <div className="xpo_container">
                    
            <div className="xpo_relative xpo_z-10 xpo_container xpo_mx-auto xpo_px-4 xpo_py-12">
                {/* Header */}
                <div className="xpo_text-center xpo_mb-16">
                    <div className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_bg-scprimary-100 xpo_text-scprimary-700 xpo_px-4 xpo_py-2 xpo_rounded-full xpo_text-sm xpo_font-medium xpo_mb-6">
                        <Smartphone className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                        {__('Download Our App', 'site-core')}
                    </div>
                    <h1 className="xpo_text-5xl md:xpo_text-6xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scwhite-600 xpo_mb-6">
                        {__('Shop Smarter with', 'site-core')}
                        <span className="xpo_block xpo_bg-gradient-to-r xpo_from-scprimary-600 dark:xpo_from-scaccent-100 xpo_to-scaccent-600 dark:xpo_to-scwhite-600 xpo_bg-clip-text xpo_text-transparent">
                        {__('MoonlitMeadow', 'site-core')}
                        </span>
                    </h1>
                    <p className="xpo_text-xl xpo_text-gray-600 dark:xpo_text-scwhite-600 xpo_max-w-2xl xpo_mx-auto">
                        {__('Experience enterprise-grade e-commerce at your fingertips. Download now and enjoy exclusive mobile-only deals.', 'site-core')}
                    </p>
                </div>

                {/* Main Content */}
                <div className="xpo_grid lg:xpo_grid-cols-2 xpo_gap-12 xpo_items-center xpo_mb-20">
                    {/* Left Column - App Preview */}
                    <div className="xpo_relative">
                        <div className="xpo_relative xpo_z-10">
                            <div className="xpo_bg-gradient-to-br xpo_from-scwhite xpo_to-scwhite-50 xpo_rounded-3xl xpo_shadow-2xl xpo_p-8 xpo_backdrop-blur-sm xpo_border xpo_border-scwhite-200">
                                {currentPlatform && (
                                    <div className={`xpo_bg-gradient-to-r ${currentPlatform.color} xpo_text-scwhite xpo_rounded-2xl xpo_p-8 xpo_mb-6`}>
                                        <div className="xpo_flex xpo_items-center xpo_mb-4">
                                        {currentPlatform.icon}
                                            <h3 className="xpo_text-2xl xpo_font-bold xpo_ml-3">{currentPlatform.name}</h3>
                                        </div>
                                        <p className="xpo_text-scwhite xpo_opacity-90 xpo_mb-6">{currentPlatform.description}</p>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={currentPlatform.url}
                                            className="xpo_inline-flex xpo_items-center xpo_bg-scwhite xpo_text-gray-900 xpo_px-8 xpo_py-4 xpo_rounded-xl xpo_font-semibold xpo_text-lg hover:xpo_shadow-xl xpo_transition-all xpo_transform hover:xpo_scale-105"
                                        >
                                            <Download className="xpo_w-5 xpo_h-5 xpo_mr-2" />
                                            {currentPlatform.buttonText}
                                            <ExternalLink className="xpo_w-4 xpo_h-4 xpo_ml-2" />
                                        </a>
                                    </div>
                                )}

                                {/* QR Code */}
                                <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_p-6 xpo_text-center xpo_border xpo_border-gray-200">
                                    <p className="xpo_text-sm xpo_text-gray-600 xpo_mb-4 xpo_font-medium">
                                        {__('Scan QR Code to Download', 'site-core')}
                                    </p>
                                    <div className="xpo_inline-block xpo_p-4 xpo_bg-scwhite xpo_rounded-xl xpo_shadow-md">
                                        {/* <img 
                                            src={qrCode} 
                                            alt="QR Code" 
                                            className="xpo_w-48 xpo_h-48"
                                        /> */}
                                        {appUrl && (
                                            <QRCode
                                                size={200}
                                                value={appUrl}
                                                bgColor={theme == 'dark' ? '#0A1D37' : '#FFFFFF'}
                                                fgColor={theme == 'dark' ? '#FFFFFF' : '#000000'}
                                                className="xpo_w-48 xpo_h-48"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rating Badge */}
                            <div className="xpo_absolute xpo_-top-6 xpo_-right-6 xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-xl xpo_p-4 xpo_border xpo_border-scaccent-200">
                                <div className="xpo_flex xpo_items-center xpo_mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="xpo_w-5 xpo_h-5 xpo_fill-yellow-400 xpo_text-yellow-400" />
                                    ))}
                                </div>
                                <p className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">4.9</p>
                                <p className="xpo_text-sm xpo_text-gray-600">10M+ {__('Downloads', 'site-core')}</p>
                            </div>
                        </div>

                        {/* Decorative circle */}
                        <div className="xpo_absolute xpo_-bottom-8 xpo_-left-8 xpo_w-64 xpo_h-64 xpo_bg-scprimary-300 xpo_rounded-full xpo_blur-3xl xpo_opacity-30"></div>
                    </div>

                    {/* Right Column - Features */}
                    <div>
                        <h2 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scwhite-600 xpo_mb-8">{__('Why Choose Our App?', 'site-core')}</h2>
                        
                        <div className="xpo_grid xpo_grid-cols-2 xpo_gap-6 xpo_mb-8">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="xpo_bg-scwhite xpo_rounded-2xl xpo_p-6 xpo_shadow-lg hover:xpo_shadow-xl xpo_transition-all xpo_border xpo_border-gray-100 hover:xpo_border-scprimary-200"
                                >
                                    <div className="xpo_bg-gradient-to-br xpo_from-scprimary-100 xpo_to-scaccent-100 xpo_w-14 xpo_h-14 xpo_rounded-xl xpo_flex xpo_items-center xpo_justify-center xpo_mb-4 xpo_text-scprimary-600">
                                        {feature.icon}
                                    </div>
                                    <h3 className="xpo_font-bold xpo_text-gray-900 xpo_mb-2">{feature.title}</h3>
                                    <p className="xpo_text-sm xpo_text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_p-8 xpo_shadow-lg xpo_border xpo_border-gray-100">
                            <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">
                                {__('App Features', 'site-core')}
                            </h3>
                            <ul className="xpo_space-y-4">
                                {benefits.map((benefit, index) => (
                                <li key={index} className="xpo_flex xpo_items-start">
                                    <div className="xpo_flex-shrink-0 xpo_w-6 xpo_h-6 xpo_bg-scprimary-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mr-3 xpo_mt-0.5">
                                        <Check className="xpo_w-4 xpo_h-4 xpo_text-scprimary-600" />
                                    </div>
                                    <span className="xpo_text-gray-700">{benefit}</span>
                                </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="xpo_bg-gradient-to-r xpo_from-scprimary-600 xpo_to-scaccent-600 xpo_rounded-3xl xpo_p-12 xpo_text-center xpo_shadow-2xl">
                    <div className="xpo_grid md:xpo_grid-cols-4 xpo_gap-8">
                        <div>
                            <div className="xpo_text-4xl xpo_font-bold xpo_text-scwhite xpo_mb-2">10M+</div>
                            <div className="xpo_text-scwhite xpo_opacity-90">{__('Active Users', 'site-core')}</div>
                        </div>
                        <div>
                            <div className="xpo_text-4xl xpo_font-bold xpo_text-scwhite xpo_mb-2">4.9★</div>
                            <div className="xpo_text-scwhite xpo_opacity-90">{__('App Rating', 'site-core')}</div>
                        </div>
                        <div>
                            <div className="xpo_text-4xl xpo_font-bold xpo_text-scwhite xpo_mb-2">50M+</div>
                            <div className="xpo_text-scwhite xpo_opacity-90">{__('Downloads', 'site-core')}</div>
                        </div>
                        <div>
                            <div className="xpo_text-4xl xpo_font-bold xpo_text-scwhite xpo_mb-2">24/7</div>
                            <div className="xpo_text-scwhite xpo_opacity-90">{__('Support', 'site-core')}</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="xpo_text-center xpo_mt-16">
                    <p className="xpo_text-gray-600 dark:xpo_text-scwhite-600 xpo_mb-4">
                        {__('Available on multiple platforms', 'site-core')}
                    </p>
                    <div className="xpo_flex xpo_flex-wrap xpo_justify-center xpo_gap-4">
                        {Object.entries(platformConfig).map(([key, config]) => (
                        <a
                            key={key}
                            target="_blank"
                            href={config.url}
                            rel="noopener noreferrer"
                            className={`xpo_inline-flex xpo_items-center xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium xpo_transition-all hover:xpo_shadow-lg ${
                            key === platform 
                                ? 'xpo_bg-gray-900 xpo_text-scwhite' 
                                : 'xpo_bg-scwhite xpo_text-gray-700 xpo_border xpo_border-gray-300 hover:xpo_border-gray-400'
                            }`}
                        >
                            {config.icon}
                            <span className="xpo_ml-2">{config.name}</span>
                        </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};

const PageBody = () => {
    return (
        <div>
            <SiteHeader />
            <AppInstallPage />
            <SiteFooter />
        </div>
    )
}

export default PageBody;