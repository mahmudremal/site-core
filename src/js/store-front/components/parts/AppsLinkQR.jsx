import OSIcons from './OSIcons';
import QRCode from 'react-qr-code';
import { site_url } from '@functions';


export default function AppsLinkQR({ __, theme }) {


    return (
        <div aria-label="App download options" className="mt-2 p-2 rounded-lg mx-auto text-center relative">
            <h2 className="text-xl font-semibold mb-5">{__('Download Our App', 'site-core')}</h2>

            <p className="text-gray-700 dark:text-scwhite text-sm mb-6">{__('Choose your platform or scan the QR code below:', 'site-core')}</p>

            <div className="flex justify-center gap-8 mb-8">
                {/* iOS */}
                <a target="_blank" rel="noopener noreferrer" href="https://apps.apple.com/us/app/daraz-online-shopping-app/id978058048" className="flex flex-col items-center transition duration-200 hover:text-blue-400">
                    <span
                        className="w-12 h-12"
                        dangerouslySetInnerHTML={{ __html: OSIcons.ios }}
                    />
                    <span className="text-xs mt-2 font-medium">iOS</span>
                </a>

                {/* Android */}
                <a target="_blank" rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=com.daraz.android" className="flex flex-col items-center transition duration-200 hover:text-green-400">
                    <span
                        className="w-12 h-12"
                        dangerouslySetInnerHTML={{ __html: OSIcons.android }}
                    />
                    <span className="text-xs mt-2 font-medium">Android</span>
                </a>

                {/* Hermony OS */}
                <a target="_blank" rel="noopener noreferrer" href="https://appgallery.huawei.com/?spm=a2a0e.store_product.footer_top.huawei.1d60631aB2A1xf&scm=1003.4.icms-zebra-100022982-2874591.OTHER_5436817469_2538051#/app/C100948133" className="flex flex-col items-center transition duration-200 hover:text-purple-400">
                    <span
                        className="w-12 h-12"
                        dangerouslySetInnerHTML={{ __html: OSIcons.hermony }}
                    />
                    <span className="text-xs mt-2 font-medium">Hermony OS</span>
                </a>
            </div>

            <div className="inline-block bg-white dark:bg-scprimary dark:border dark:border-scwhite p-4 rounded-lg shadow-md">
                <QRCode
                    size={200}
                    value={site_url('apps')}
                    bgColor={theme == 'dark' ? '#0A1D37' : '#FFFFFF'}
                    fgColor={theme == 'dark' ? '#FFFFFF' : '#000000'}
                    className="w-48 h-48"
                />
                <p className="text-gray-700 dark:text-scwhite text-xs mt-3">{__('Scan QR code to download', 'site-core')}</p>
            </div>
        </div>
    )
}