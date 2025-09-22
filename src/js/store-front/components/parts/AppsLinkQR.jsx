
import QRCode from 'react-qr-code';
import OSIcons from './OSIcons';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';

export default function AppsLinkQR() {
    const { __ } = useLocale();
    const { money } = useCurrency();
    return (
        <div aria-label="App download options" className="xpo_mt-2 xpo_p-2 xpo_rounded-lg xpo_mx-auto xpo_text-center xpo_relative">
            <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-5">{__('Download Our App', 'site-core')}</h2>

            <p className="xpo_text-gray-700 xpo_text-sm xpo_mb-6">{__('Choose your platform or scan the QR code below:', 'site-core')}</p>

            <div className="xpo_flex xpo_justify-center xpo_gap-8 xpo_mb-8">
                {/* iOS */}
                <a target="_blank" rel="noopener noreferrer" href="https://apps.apple.com/us/app/daraz-online-shopping-app/id978058048" className="xpo_flex xpo_flex-col xpo_items-center xpo_transition xpo_duration-200 hover:xpo_text-blue-400">
                <span
                    className="xpo_w-12 xpo_h-12"
                    dangerouslySetInnerHTML={{ __html: OSIcons.ios }}
                />
                <span className="xpo_text-xs xpo_mt-2 xpo_font-medium">iOS</span>
                </a>

                {/* Android */}
                <a target="_blank" rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=com.daraz.android" className="xpo_flex xpo_flex-col xpo_items-center xpo_transition xpo_duration-200 hover:xpo_text-green-400">
                <span
                    className="xpo_w-12 xpo_h-12"
                    dangerouslySetInnerHTML={{ __html: OSIcons.android }}
                />
                <span className="xpo_text-xs xpo_mt-2 xpo_font-medium">Android</span>
                </a>

                {/* Hermony OS */}
                <a target="_blank" rel="noopener noreferrer" href="https://appgallery.huawei.com/?spm=a2a0e.store_product.footer_top.huawei.1d60631aB2A1xf&scm=1003.4.icms-zebra-100022982-2874591.OTHER_5436817469_2538051#/app/C100948133" className="xpo_flex xpo_flex-col xpo_items-center xpo_transition xpo_duration-200 hover:xpo_text-purple-400">
                <span
                    className="xpo_w-12 xpo_h-12"
                    dangerouslySetInnerHTML={{ __html: OSIcons.hermony }}
                />
                <span className="xpo_text-xs xpo_mt-2 xpo_font-medium">Hermony OS</span>
                </a>
            </div>

            <div className="xpo_inline-block xpo_bg-white xpo_p-4 xpo_rounded-lg xpo_shadow-md">
                <QRCode size={200} value={`${location.origin}/apps`} className="xpo_w-48 xpo_h-48" />
                <p className="xpo_text-gray-700 xpo_text-xs xpo_mt-3">{__('Scan QR code to download', 'site-core')}</p>
            </div>
        </div>
    )
}