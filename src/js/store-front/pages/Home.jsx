import { Suspense, lazy } from 'react';
import HomePageHelmet from '../components/helmets/HomePageHelmet';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import MoonlitSky from '../components/backgrounds/MoonlitSky';

// Example config for Home page
const homePageConfig = [
  { type: 'heroBanner', props: { bannerId: 'spring-sale' } },
  { type: 'productCarousel', props: { category: 'Sample Category', recommendationType: 'personalized' } },
  { type: 'contentBlock', props: { contentId: 'how-to-shop' } },
  { type: 'categoryGrid', props: { categories: ['electronics', 'fashion', 'home', 'toys'] } },
  { type: 'justForYou', props: { card_bg: 'xpo_p-4 xpo_bg-scwhite/70 xpo_rounded-xl', categories: ['electronics', 'fashion', 'home', 'toys'] } },
];

const componentMap = {
  heroBanner: lazy(() => import('../components/common/HeroBanner')),
  // productCarousel: lazy(() => import('../components/product/ProductCarousel')),
  justForYou: lazy(() => import('../components/product/ProductCatalogue')),
  contentBlock: lazy(() => import('../components/common/ContentBlock')),
  categoryGrid: lazy(() => import('../components/category/CategoryGrid')),
};



function DynamicPageRenderer({ config }) {
  return (
    <>
      {config.map(({ type, props }, index) => {
        const Component = componentMap[type];
        return Component ? <Component key={index} {...props} /> : null;
      })}
    </>
  );
}

const Home = () => {
  return (
    <div>
      <SiteHeader />
      <div className="xpo_relative xpo_min-h-screen">
        <div className="xpo_absolute xpo_h-full xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none">
          <MoonlitSky />
        </div>
        <div className="xpo_container xpo_relative xpo_z-10 xpo_mx-auto xpo_px-4 xpo_py-6 xpo_max-w-7xl">
          <HomePageHelmet />
          <Suspense fallback={<div>Loading...</div>}>
            <DynamicPageRenderer config={homePageConfig} />
          </Suspense>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Home;
