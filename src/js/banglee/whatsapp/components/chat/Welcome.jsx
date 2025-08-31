import { __, home_route } from '@js/utils';
import { Lock, MessageCircle, Smartphone, Zap } from 'lucide-react';

const Welcome = () => {
    return (
        <div className="xpo_flex-1 xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_bg-gradient-to-br xpo_from-gray-50 xpo_via-white xpo_to-gray-100 xpo_min-h-screen xpo_p-6">
            <div className="xpo_max-w-2xl xpo_mx-auto xpo_text-center">
                {/* Logo/Icon Section */}
                <div className="xpo_mb-8">
                    <div className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_w-20 xpo_h-20 xpo_bg-green-500 xpo_rounded-full xpo_mb-6 xpo_shadow-lg xpo_shadow-green-200">
                        <MessageCircle size={40} className="xpo_text-white" />
                    </div>
                </div>

                {/* Main Heading */}
                <div className="xpo_mb-12">
                    <h1 className="xpo_text-5xl xpo_md:text-6xl xpo_font-bold xpo_text-gray-800 xpo_mb-4 xpo_tracking-tight">
                        {__('Banglee WhatsApp')}
                    </h1>
                    <p className="xpo_text-xl xpo_text-gray-600 xpo_leading-relaxed xpo_max-w-lg xpo_mx-auto">
                        {__('Send and receive messages without keeping your phone online.')}
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="xpo_grid xpo_md:grid-cols-3 xpo_gap-6 xpo_mb-8">
                    <div className="xpo_bg-white xpo_p-6 xpo_rounded-xl xpo_shadow-sm xpo_border xpo_border-gray-100 xpo_hover:shadow-md xpo_transition-shadow">
                        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_w-12 xpo_h-12 xpo_bg-blue-100 xpo_rounded-lg xpo_mb-4 xpo_mx-auto">
                            <Smartphone size={24} className="xpo_text-blue-600" />
                        </div>
                        <h3 className="xpo_font-semibold xpo_text-gray-800 xpo_mb-2">
                            {__('Phone Independent')}
                        </h3>
                        <p className="xpo_text-sm xpo_text-gray-600">
                            {__('Works even when your phone is offline')}
                        </p>
                    </div>

                    <div className="xpo_bg-white xpo_p-6 xpo_rounded-xl xpo_shadow-sm xpo_border xpo_border-gray-100 xpo_hover:shadow-md xpo_transition-shadow">
                        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_w-12 xpo_h-12 xpo_bg-green-100 xpo_rounded-lg xpo_mb-4 xpo_mx-auto">
                            <Lock size={24} className="xpo_text-green-600" />
                        </div>
                        <h3 className="xpo_font-semibold xpo_text-gray-800 xpo_mb-2">
                            {__('Secure')}
                        </h3>
                        <p className="xpo_text-sm xpo_text-gray-600">
                            {__('End-to-end encrypted messages')}
                        </p>
                    </div>

                    <div className="xpo_bg-white xpo_p-6 xpo_rounded-xl xpo_shadow-sm xpo_border xpo_border-gray-100 xpo_hover:shadow-md xpo_transition-shadow">
                        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_w-12 xpo_h-12 xpo_bg-purple-100 xpo_rounded-lg xpo_mb-4 xpo_mx-auto">
                            <Zap size={24} className="xpo_text-purple-600" />
                        </div>
                        <h3 className="xpo_font-semibold xpo_text-gray-800 xpo_mb-2">
                            {__('Fast')}
                        </h3>
                        <p className="xpo_text-sm xpo_text-gray-600">
                            {__('Lightning-fast message delivery')}
                        </p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-gray-800 xpo_text-white xpo_rounded-full xpo_text-sm xpo_font-medium">
                    <Lock size={16} className="xpo_mr-2" />
                    <span>{__('End-to-end encrypted')}</span>
                </div>

                {/* Subtle Animation */}
                <div className="xpo_mt-12 xpo_opacity-60">
                    <div className="xpo_animate-pulse xpo_w-2 xpo_h-2 xpo_bg-gray-400 xpo_rounded-full xpo_mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;