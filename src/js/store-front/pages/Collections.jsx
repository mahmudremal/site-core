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
  // const { __ } = useLocale();
  // const { money } = useCurrency();
  const { type: collectionType } = useParams();
  // const [loading, setLoading] = useState(null);

  return (
    <>
      <RecommendedCrossCollections collectionType={collectionType} />
      <ProductCatalogue tools={true} shadow={true} maxPaginations={12} />
    </>
  );
};

const PageBody = () => {
  const { __ } = useLocale();
  return (
    <div>
      <SiteHeader />
      <div className="container relative z-10 mx-auto px-4 pt-8 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-scprimary dark:text-scwhite">{__('Collections', 'site-core')}</h1>
          <p className="text-lg text-scprimary-400 dark:text-scwhite-600">{__('Discover curated collections and products tailored just for you', 'site-core')}</p>
        </div>
        <CollectionsPage />
      </div>
      <SiteFooter />
    </div>
  )
}

export default PageBody;
