/*
  Enterprise-grade ecommerce footer for a massive platform like daraz.com.
  Features:
  - Multi-column layout with company info, customer service, policies, social links
  - App install section with 3 OS (iOS, Android, Hermony OS) icons + QR code
  - Smart toggle: when user clicks/taps on "Download Our App", show a modal/popover with the 3 OS app links + QR code
  - TailwindCSS with  prefix for all classes
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

function SiteFooter() {
  const { __ } = useLocale();
  const { theme } = useTheme();
  const { setPopup } = usePopup();

  return (
    <div className="relative z-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-semibold mb-4">{__('MoonlitMeadow', 'site-core')}</h3>
          <p className="text-sm leading-relaxed">
            {__('The leading ecommerce platform with millions of products across all categories. Trusted by millions of customers worldwide.', 'site-core')}
          </p>
          <address className="not-italic mt-4 text-xs text-gray-400" dangerouslySetInnerHTML={{
            __html:
              __('1236 Moonmit Meadow LLC.\nNoorpur, Sanir Akhra, Dhaka\nPhone: (+880) 1814-118 328\nEmail: info@urmoonlitmeadow.com', 'site-core').replaceAll('\n', '<br />')
          }}></address>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-lg font-semibold mb-4">{__('Customer Service', 'site-core')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="hover:text-white">{__('Help Center', 'site-core')}</Link></li>
            <li><Link to="/returns" className="hover:text-white">{__('Returns & Refunds', 'site-core')}</Link></li>
            <li><Link to="/shipping" className="hover:text-white">{__('Shipping Info', 'site-core')}</Link></li>
            <li><Link to="/track" className="hover:text-white">{__('Track Order', 'site-core')}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{__('Contact Us', 'site-core')}</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-lg font-semibold mb-4">{__('Policies', 'site-core')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-white">{__('Privacy Policy', 'site-core')}</Link></li>
            <li><Link to="/terms" className="hover:text-white">{__('Terms of Service', 'site-core')}</Link></li>
            <li><Link to="/security" className="hover:text-white">{__('Security', 'site-core')}</Link></li>
            <li><Link to="/sitemap" className="hover:text-white">{__('Sitemap', 'site-core')}</Link></li>
          </ul>
        </div>

        {/* App Install & Social */}
        <div>
          <div>
            <h4 className="text-lg font-semibold mb-4">{__('Download Our App', 'site-core')}</h4>
            <button
              type="button"
              onClick={() => setPopup(<AppsLinkQR theme={theme} __={__} />)}
              className="inline-flex items-center gap-2 bg-scaccent-600 hover:bg-scaccent-700 text-white px-4 py-2 rounded-md transition"
            >
              <TabletSmartphone className="w-5 h-5" />
              <span>{__('Get the App', 'site-core')}</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-2">{__('Follow Us', 'site-core')}</h4>
            <div className="flex gap-4">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://facebook.com/urmoonlitmeadow"
                aria-label="Facebook"
                className="text-gray-400 hover:text-scaccent-600"
              >
                <svg
                  className="w-6 h-6"
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
                className="text-gray-400 hover:text-scaccent-400"
              >
                <svg
                  className="w-6 h-6"
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
                className="text-gray-400 hover:text-pink-500"
              >
                <svg
                  className="w-6 h-6"
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
      <div className="mt-12 text-center text-xs text-scwhite-600" dangerouslySetInnerHTML={{
        __html: sprintf(
          __('%s %d MoonlitMeadow. All rights reserved. A sister concern of %sGreenleaves LLC.%s', 'site-core'),
          '&copy;', new Date().getFullYear(),
          '<a href="https://uxndev.com" target="_blank">', '</a>'
        )
      }}></div>
    </div>
  );
}

export default function FooterBody() {
  return (
    <footer className="relative bg-gradient-to-b from-scprimary-900 via-scprimary-700 to-scprimary-500 text-gray-300 pt-12 pb-8 select-none">
      <div className="absolute top-0 left-0 w-full h-full">
        <MoonlitMeadow />
      </div>
      <SiteFooter />
    </footer>
  )
}
