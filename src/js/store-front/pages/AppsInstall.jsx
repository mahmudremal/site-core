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
            icon: <Apple className="w-6 h-6" />,
            url: 'https://apps.apple.com/us/app/moonlitmeadow-shopping/id978058048',
            color: 'from-gray-900 to-gray-700',
            buttonText: 'Download on the App Store',
            description: 'Get the premium shopping experience on your iPhone or iPad',
            badge: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg'
        },
        android: {
            name: 'Google Play',
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
            ),
            url: 'https://play.google.com/store/apps/details?id=com.moonlitmeadow.android',
            color: 'from-scprimary-600 to-scaccent-600',
            buttonText: 'Get it on Google Play',
            description: 'Experience seamless shopping on your Android device',
            badge: 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'
        },
        harmony: {
            name: 'AppGallery',
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
                </svg>
            ),
            url: 'https://appgallery.huawei.com/app/C100948133',
            color: 'from-red-600 to-pink-600',
            buttonText: 'Explore it on AppGallery',
            description: 'Shop with confidence on your Huawei device',
            badge: null
        },
        chrome: {
            name: 'Chrome Web Store',
            icon: <Chrome className="w-6 h-6" />,
            url: 'https://chromewebstore.google.com/detail/moonlitmeadow-client/jdkknkkbebbapilgoeccciglkfbmbnfm',
            color: 'from-scaccent-500 to-scprimary-500',
            buttonText: 'Add to Chrome',
            description: 'Install our powerful Chrome extension for desktop shopping',
            badge: null
        }
    };

    const features = [
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Secure Payments',
            description: 'Bank-grade encryption for all transactions'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Lightning Fast',
            description: 'Optimized performance for smooth shopping'
        },
        {
            icon: <Star className="w-6 h-6" />,
            title: 'Premium Quality',
            description: 'Curated selection of top-rated products'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
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
            <div className="min-h-screen flex items-center justify-center relative z-10">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-scprimary-600 dark:text-scwhite-900 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-scwhite-600 text-lg">{__('Detecting your device...', 'site-core')}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-scprimary-200 rounded-full blur-3xl opacity-20 -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-scaccent-200 rounded-full blur-3xl opacity-20 -ml-48 -mb-48"></div>

            <div className="container">

                <div className="relative z-10 container mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center bg-scprimary-100 text-scprimary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Smartphone className="w-4 h-4 mr-2" />
                            {__('Download Our App', 'site-core')}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-scwhite-600 mb-6">
                            {__('Shop Smarter with', 'site-core')}
                            <span className="block bg-gradient-to-r from-scprimary-600 dark:from-scaccent-100 to-scaccent-600 dark:to-scwhite-600 bg-clip-text text-transparent">
                                {__('MoonlitMeadow', 'site-core')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-scwhite-600 max-w-2xl mx-auto">
                            {__('Experience enterprise-grade e-commerce at your fingertips. Download now and enjoy exclusive mobile-only deals.', 'site-core')}
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        {/* Left Column - App Preview */}
                        <div className="relative">
                            <div className="relative z-10">
                                <div className="bg-gradient-to-br from-scwhite to-scwhite-50 rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-scwhite-200">
                                    {currentPlatform && (
                                        <div className={`bg-gradient-to-r ${currentPlatform.color} text-scwhite rounded-2xl p-8 mb-6`}>
                                            <div className="flex items-center mb-4">
                                                {currentPlatform.icon}
                                                <h3 className="text-2xl font-bold ml-3">{currentPlatform.name}</h3>
                                            </div>
                                            <p className="text-scwhite opacity-90 mb-6">{currentPlatform.description}</p>
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={currentPlatform.url}
                                                className="inline-flex items-center bg-scwhite text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
                                            >
                                                <Download className="w-5 h-5 mr-2" />
                                                {currentPlatform.buttonText}
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </a>
                                        </div>
                                    )}

                                    {/* QR Code */}
                                    <div className="bg-scwhite rounded-2xl p-6 text-center border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-4 font-medium">
                                            {__('Scan QR Code to Download', 'site-core')}
                                        </p>
                                        <div className="inline-block p-4 bg-scwhite rounded-xl shadow-md">
                                            {/* <img 
                                            src={qrCode} 
                                            alt="QR Code" 
                                            className="w-48 h-48"
                                        /> */}
                                            {appUrl && (
                                                <QRCode
                                                    size={200}
                                                    value={appUrl}
                                                    bgColor={theme == 'dark' ? '#0A1D37' : '#FFFFFF'}
                                                    fgColor={theme == 'dark' ? '#FFFFFF' : '#000000'}
                                                    className="w-48 h-48"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Badge */}
                                <div className="absolute -top-6 -right-6 bg-scwhite rounded-2xl shadow-xl p-4 border border-scaccent-200">
                                    <div className="flex items-center mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">4.9</p>
                                    <p className="text-sm text-gray-600">10M+ {__('Downloads', 'site-core')}</p>
                                </div>
                            </div>

                            {/* Decorative circle */}
                            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-scprimary-300 rounded-full blur-3xl opacity-30"></div>
                        </div>

                        {/* Right Column - Features */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-scwhite-600 mb-8">{__('Why Choose Our App?', 'site-core')}</h2>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="bg-scwhite rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-scprimary-200"
                                    >
                                        <div className="bg-gradient-to-br from-scprimary-100 to-scaccent-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-scprimary-600">
                                            {feature.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-scwhite rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    {__('App Features', 'site-core')}
                                </h3>
                                <ul className="space-y-4">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-scprimary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <Check className="w-4 h-4 text-scprimary-600" />
                                            </div>
                                            <span className="text-gray-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-gradient-to-r from-scprimary-600 to-scaccent-600 rounded-3xl p-12 text-center shadow-2xl">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-4xl font-bold text-scwhite mb-2">10M+</div>
                                <div className="text-scwhite opacity-90">{__('Active Users', 'site-core')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-scwhite mb-2">4.9★</div>
                                <div className="text-scwhite opacity-90">{__('App Rating', 'site-core')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-scwhite mb-2">50M+</div>
                                <div className="text-scwhite opacity-90">{__('Downloads', 'site-core')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-scwhite mb-2">24/7</div>
                                <div className="text-scwhite opacity-90">{__('Support', 'site-core')}</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center mt-16">
                        <p className="text-gray-600 dark:text-scwhite-600 mb-4">
                            {__('Available on multiple platforms', 'site-core')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {Object.entries(platformConfig).map(([key, config]) => (
                                <a
                                    key={key}
                                    target="_blank"
                                    href={config.url}
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg ${key === platform
                                            ? 'bg-gray-900 text-scwhite'
                                            : 'bg-scwhite text-gray-700 border border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    {config.icon}
                                    <span className="ml-2">{config.name}</span>
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