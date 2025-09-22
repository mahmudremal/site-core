import { useState } from "react";
import Reviews from '../reviews/Reviews'
import { SkeletonLoader } from "../skeletons/SkeletonLoader";
import { useLocale } from "../../hooks/useLocale";
import { useCurrency } from "../../hooks/useCurrency";

export default function ProductTabs({ loading = false, product = {} }) {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const [activeTab, setActiveTab] = useState('description');

    const tabsSections = [
      ['description', __('Description', 'site-core')],
      ['specs', __('Specifications', 'site-core')],
      ['reviews', __('Reviews', 'site-core')]
    ];

    return (
      <div className="xpo_tabs xpo_bg-scwhite/70 xpo_rounded-lg xpo_shadow-lg xpo_mb-12">
        <div className="xpo_border-b xpo_border-gray-200 xpo_w-full">
          <nav className="xpo_flex" role="tablist" aria-label="Product details tabs">
            {tabsSections.map(([tabID, tabLabel], index) => (
              <button
                role="tab"
                key={index}
                id={`${tabID}TabButton`}
                aria-controls={`${tabID}Tab`}
                onClick={() => setActiveTab(tabID)}
                aria-selected={activeTab === tabID}
                className={`xpo_px-6 xpo_py-4 xpo_font-medium focus:xpo_outline-none ${
                  activeTab === tabID ? 'xpo_text-gray-700 xpo_border-b-2 xpo_border-scprimary-600' : 'xpo_text-gray-500 hover:xpo_text-gray-700'
                }`}
              >
                {tabLabel}
              </button>
            ))}
          </nav>
        </div>
        <div className="xpo_p-8 xpo_w-full">
          <section className={`${activeTab === 'description' ? '' : 'xpo_hidden'}`}>
            <h3 className="xpo_text-xl xpo_font-semibold xpo_mb-4">Product Description</h3>
            {loading ? (
              <div className="space-y-2">
                <SkeletonLoader className="xpo_h-4 xpo_w-full" />
                <SkeletonLoader className="xpo_h-4 xpo_w-5/6" />
                <SkeletonLoader className="xpo_h-4 xpo_w-4/5" />
              </div>
            ) : (
              <div className="xpo_text-gray-700 xpo_leading-relaxed" dangerouslySetInnerHTML={{ __html: product?.description }} />
            )}
          </section>
          <section className={`${activeTab === 'specs' ? '' : 'xpo_hidden'}`}>
            <h3 className="xpo_text-xl xpo_font-semibold xpo_mb-4">Technical Specifications</h3>
            {loading ? (
              <SkeletonLoader className="xpo_h-48 xpo_w-full" />
            ) : product?.metadata?.specifications?.length ? (
              <table className="xpo_w-full xpo_border-collapse xpo_border xpo_border-gray-300">
                <tbody>
                  {(product.metadata.specifications || []).map(({label, value}, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'xpo_bg-gray-50' : ''}>
                      <td className="xpo_border xpo_border-gray-300 xpo_px-4 xpo_py-2 xpo_font-medium">{label}</td>
                      <td className="xpo_border xpo_border-gray-300 xpo_px-4 xpo_py-2">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="xpo_text-gray-500">{__('No specifications available', 'site-core')}</p>
            )}
          </section>
          <section className={`${activeTab === 'reviews' ? '' : 'xpo_hidden'}`}>
            <Reviews visible={activeTab === 'reviews'} />
          </section>
        </div>
      </div>
    )
}