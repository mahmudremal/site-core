import { Suspense, lazy, useEffect, useState } from 'react';
import HomePageHelmet from '../components/helmets/HomePageHelmet';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import DynamicPageRenderer from '../components/layout/DynamicPageRenderer';
// import MoonlitMeadowLogo from '../components/parts/MoonlitMeadowLogo';
import { SkeletonLoader } from '../components/skeletons/SkeletonLoader';
import { notify } from '@functions';
import api from '../services/api';

const PageBody = () => {
  const [template, setTemplate] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const delay = setTimeout(() => {
      // setLoading(true);
      api.get('pages/home')
      .then(res => res.data)
      .then(data => {
        setTemplate(data.template);
      })
      .catch(err => notify.error(err))
      .finally(() => setLoading(false));
    }, 2000);
  
    return () => clearTimeout(delay);
  }, []);

  return (
    <div>
      <SiteHeader />
      <HomePageHelmet />
      {/* <MoonlitMeadowLogo /> */}
      <div className="xpo_min-h-screen">
        {loading ? <HomepageSkeleton /> : <DynamicPageRenderer template={template} />}
      </div>
      <SiteFooter />
    </div>
  );
};

export default PageBody;


const HomepageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <SkeletonLoader className="h-96 w-full rounded-lg" />
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <SkeletonLoader className="h-12 w-64 rounded" />
          <SkeletonLoader className="h-12 w-48 rounded hidden sm:block" />
        </div>
      </section>

      {/* Text Block Section */}
      <section className="mb-12">
        <SkeletonLoader className="h-8 w-48 mb-4 rounded" /> {/* Heading */}
        <SkeletonLoader className="h-4 w-full mb-2 rounded" />
        <SkeletonLoader className="h-4 w-5/6 rounded" />
        <SkeletonLoader className="h-4 w-4/5 rounded" />
      </section>

      {/* Categories Grid Section */}
      <section className="mb-12">
        <SkeletonLoader className="h-8 w-48 mb-6 rounded" /> {/* Section heading */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <SkeletonLoader className="h-32 w-full rounded-lg" /> {/* Category image */}
              <SkeletonLoader className="h-4 w-20 rounded" /> {/* Category title */}
            </div>
          ))}
        </div>
      </section>

      {/* Products Section (4-column grid) */}
      <section className="mb-12">
        <SkeletonLoader className="h-8 w-48 mb-6 rounded" /> {/* Section heading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonLoader className="h-48 w-full rounded-lg" /> {/* Product image */}
              <SkeletonLoader className="h-4 w-3/4 rounded" /> {/* Product title */}
              <SkeletonLoader className="h-4 w-1/2 rounded" /> {/* Product price/description */}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
