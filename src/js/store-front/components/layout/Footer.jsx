/*
  Enterprise-grade ecommerce footer for a massive platform like daraz.com.
  Features:
  - Multi-column layout with company info, customer service, policies, social links
  - App install section with 3 OS (iOS, Android, Hermony OS) icons + QR code
  - Smart toggle: when user clicks/taps on "Download Our App", show a modal/popover with the 3 OS app links + QR code
  - TailwindCSS with xpo_ prefix for all classes
*/

  
import { __ } from '@js/utils';
import { TabletSmartphone } from "lucide-react";
import { usePopup } from '../../hooks/usePopup';
import AppsLinkQR from '../parts/AppsLinkQR';
import MoonlitMeadow from '../backgrounds/MoonlitMeadows';
import { useLocale } from '../../hooks/useLocale';
import { sprintf } from 'sprintf-js';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export default function SiteFooter() {
  const { __ } = useLocale();
  const { theme } = useTheme();
  const { setPopup } = usePopup();
  
  return (
    <footer className="xpo_relative xpo_bg-gradient-to-b xpo_from-scprimary-900 xpo_via-scprimary-700 xpo_to-scprimary-500 xpo_text-gray-300 xpo_pt-12 xpo_pb-8 xpo_select-none">
      <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full">
        <MoonlitMeadow />
      </div>
      <div className="xpo_relative xpo_z-10">
        <div className="xpo_container xpo_mx-auto xpo_px-6 xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-4 xpo_gap-8">
          {/* Company Info */}
          <div>
            <h3 className="xpo_text-xl xpo_font-semibold xpo_mb-4">MoonlitMeadow</h3>
            <p className="xpo_text-sm xpo_leading-relaxed">
              {__('The leading ecommerce platform with millions of products across all categories. Trusted by millions of customers worldwide.', 'site-core')}
            </p>
            <address className="xpo_not-italic xpo_mt-4 xpo_text-xs xpo_text-gray-400">
              1236 Moonmit Meadow LLC.<br />
              Noorpur, Sanir Akhra, Dhaka<br />
              Phone: (+880) 1814-118 328<br />
              Email: info@urmoonlitmeadow.com
            </address>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="xpo_text-lg xpo_font-semibold xpo_mb-4">Customer Service</h4>
            <ul className="xpo_space-y-2 xpo_text-sm">
              <li><Link href="/help" className="hover:xpo_text-white">Help Center</Link></li>
              <li><Link href="/returns" className="hover:xpo_text-white">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="hover:xpo_text-white">Shipping Info</Link></li>
              <li><Link href="/track" className="hover:xpo_text-white">Track Order</Link></li>
              <li><Link href="/contact" className="hover:xpo_text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="xpo_text-lg xpo_font-semibold xpo_mb-4">Policies</h4>
            <ul className="xpo_space-y-2 xpo_text-sm">
              <li><Link href="/privacy" className="hover:xpo_text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:xpo_text-white">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:xpo_text-white">Security</Link></li>
              <li><Link href="/sitemap" className="hover:xpo_text-white">Sitemap</Link></li>
            </ul>
          </div>

          {/* App Install & Social */}
          <div>
            <h4 className="xpo_text-lg xpo_font-semibold xpo_mb-4">{__('Download Our App', 'site-core')}</h4>
            <button
              type="button"
              onClick={() => setPopup(<AppsLinkQR theme={theme} __={__} />)}
              className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 hover:xpo_bg-blue-700 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md xpo_transition"
            >
              <TabletSmartphone className="xpo_w-5 xpo_h-5" />
              <span>{__('Get the App', 'site-core')}</span>
            </button>

            {/* Social Links */}
            <div className="xpo_mt-8">
              <h4 className="xpo_text-lg xpo_font-semibold xpo_mb-2">Follow Us</h4>
              <div className="xpo_flex xpo_gap-4">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://facebook.com/urmoonlitmeadow"
                  aria-label="Facebook"
                  className="xpo_text-gray-400 hover:xpo_text-blue-600"
                >
                  <svg
                    className="xpo_w-6 xpo_h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2c0-2 1-3 3-3h2v3h-2c-.5 0-1 .5-1 1v2h3l-1 3h-2v7A10 10 0 0022 12z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/urmoonlitmeadow"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="xpo_text-gray-400 hover:xpo_text-blue-400"
                >
                  <svg
                    className="xpo_w-6 xpo_h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.98-2.48 9.14 9.14 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.12A12.8 12.8 0 013 4.15a4.52 4.52 0 001.4 6.04 4.48 4.48 0 01-2.05-.57v.06a4.52 4.52 0 003.63 4.43 4.52 4.52 0 01-2.04.08 4.52 4.52 0 004.22 3.14A9 9 0 013 19.54a12.7 12.7 0 006.92 2" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/urmoonlitmeadow"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="xpo_text-gray-400 hover:xpo_text-pink-500"
                >
                  <svg
                    className="xpo_w-6 xpo_h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37a4 4 0 11-4.73-4.73 4 4 0 014.73 4.73z" />
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="xpo_mt-12 xpo_text-center xpo_text-xs xpo_text-scwhite-600" dangerouslySetInnerHTML={{__html: sprintf(
            __('%s %d MoonlitMeadow. All rights reserved. A sister concern of %sGreenleaves LLC.%s', 'site-core'),
            '&copy;', new Date().getFullYear(), 
            '<a href="https://uxndev.com" target="_blank">','</a>'
          )}}></div>
      </div>
    </footer>
  );
}
