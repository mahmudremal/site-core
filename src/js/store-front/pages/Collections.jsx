import { useState } from 'react';
import { useParams } from 'react-router-dom';
import SiteFooter from '../components/layout/Footer';
import SiteHeader from '../components/layout/Header';
import RecommendedCrossCollections from '../components/parts/RecommendedCrossCollections';
import { __ } from '@js/utils';
import ProductCatalogue from '../components/product/ProductCatalogue';
import { useCurrency } from '../hooks/useCurrency';
import { useLocale } from '../hooks/useLocale';

const CollectionsPage = () => {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { type: collectionType } = useParams();
  const [loading, setLoading] = useState(null);

  return (
    <>
      <RecommendedCrossCollections collectionType={collectionType} />
      <ProductCatalogue tools={true} shadow={true} maxPaginations={12} />
    </>
  );
};

const PageBody = () => {
  return (
    <div>
      <SiteHeader />
      <div className="xpo_container xpo_relative xpo_z-10 xpo_mx-auto xpo_px-4 xpo_pt-8 xpo_pb-12">
        <div className="xpo_mb-8">
          <h1 className="xpo_text-4xl xpo_font-bold xpo_mb-4 xpo_text-scprimary dark:xpo_text-scwhite">{__('Collections', 'site-core')}</h1>
          <p className="xpo_text-lg xpo_text-scprimary-400 dark:xpo_text-scwhite-600">{__('Discover curated collections and products tailored just for you', 'site-core')}</p>
        </div>
        <CollectionsPage />
      </div>
      <SiteFooter />
    </div>
  )
}

export default PageBody;
