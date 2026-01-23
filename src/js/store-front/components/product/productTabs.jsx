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
    <div className="tabs bg-scwhite/70 rounded-lg shadow-lg mb-12">
      <div className="border-b border-gray-200 w-full">
        <nav className="flex" role="tablist" aria-label="Product details tabs">
          {tabsSections.map(([tabID, tabLabel], index) => (
            <button
              role="tab"
              key={index}
              id={`${tabID}TabButton`}
              aria-controls={`${tabID}Tab`}
              onClick={() => setActiveTab(tabID)}
              aria-selected={activeTab === tabID}
              className={`px-6 py-4 font-medium focus:outline-none ${activeTab === tabID ? 'text-gray-700 border-b-2 border-scprimary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tabLabel}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-8 w-full">
        <section className={`${activeTab === 'description' ? '' : 'hidden'}`}>
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          {loading ? (
            <div className="space-y-2">
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-5/6" />
              <SkeletonLoader className="h-4 w-4/5" />
            </div>
          ) : (
            <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product?.description }} />
          )}
        </section>
        <section className={`${activeTab === 'specs' ? '' : 'hidden'}`}>
          <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
          {loading ? (
            <SkeletonLoader className="h-48 w-full" />
          ) : product?.metadata?.specifications?.length ? (
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                {(product.metadata.specifications || []).map(({ label, value }, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{label}</td>
                    <td className="border border-gray-300 px-4 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">{__('No specifications available', 'site-core')}</p>
          )}
        </section>
        <section className={`${activeTab === 'reviews' ? '' : 'hidden'}`}>
          <Reviews visible={activeTab === 'reviews'} />
        </section>
      </div>
    </div>
  )
}