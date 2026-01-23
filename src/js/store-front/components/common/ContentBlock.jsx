import { useEffect } from 'react';
import { useLocale } from "../../hooks/useLocale";
import { Shield, Clock, Headphones, TrendingUp } from 'lucide-react';

const ContentBlock = ({ content = null, onLoaded = null }) => {
  const { __ } = useLocale();
  const defaultContent = {
    headline: __('Your Trusted Shopping Partner in Bangladesh', 'site-core'),
    description: __('At MoonlitMeadow, we\'ve built more than just an online store. We\'ve created a reliable destination where thousands of customers find quality products, honest service, and peace of mind with every purchase.', 'site-core'),
    stats: [
      { number: "50,000+", label: __('Happy Customers', 'site-core') },
      { number: '99.2%', label: __('On-Time Delivery', 'site-core') },
      { number: '24/7', label: __('Customer Support', 'site-core') },
      { number: '10,000+', label: __('Products Available', 'site-core') }
    ],
    commitments: [
      {
        icon: Shield,
        title: __('Secure & Verified', 'site-core'),
        text: __('Every transaction is protected. Every product is authenticated. Shop with complete confidence.', 'site-core')
      },
      {
        icon: Clock,
        title: __('Transparent Process', 'site-core'),
        text: __('Place your order, we verify and confirm, pack it carefully, and deliver to your doorstep. You\'ll know exactly where your order is at every step.', 'site-core')
      },
      {
        icon: Headphones,
        title: __('Always Here for You', 'site-core'),
        text: __('Questions? Concerns? Our dedicated support team is ready to assist you whenever you need us.', 'site-core')
      },
      {
        icon: TrendingUp,
        title: __('Growing With You', 'site-core'),
        text: __('We\'re constantly expanding our collection and improving our service based on what you, our valued customers, tell us you need.', 'site-core')
      }
    ]
  };

  useEffect(() => onLoaded && onLoaded(), [onLoaded]);

  const block = content || defaultContent;

  return (
    // bg-scwhite-200 dark:bg-scprimary-900
    <section className="py-20 px-4">
      <div className="container mx-auto">

        {/* Trust Statement */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-scprimary-600 dark:text-scwhite-100 mb-6 leading-tight">
            {block.headline}
          </h2>
          <p className="text-lg text-scprimary-400 dark:text-scwhite-600 leading-relaxed">
            {block.description}
          </p>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 bg-scwhite-100/70 dark:bg-scprimary-800/70 rounded-2xl p-8 shadow-sm border border-scwhite-500 dark:border-scprimary-700">
          {block.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-scaccent-500 dark:text-scaccent-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-scprimary-400 dark:text-scwhite-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Commitments Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {block.commitments.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex gap-5 p-6 bg-scwhite-100/70 dark:bg-scprimary-800/70 rounded-xl border border-scwhite-500 dark:border-scprimary-700 transition-all duration-300 hover:border-scaccent-400 dark:hover:border-scaccent-600"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-scaccent-100 dark:bg-scaccent-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-scaccent-600 dark:text-scaccent-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-scprimary-600 dark:text-scwhite-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-scprimary-400 dark:text-scwhite-600 leading-relaxed text-sm">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Message */}
        <div className="mt-12 text-center py-8 px-6 bg-gradient-to-r from-scaccent-50 to-scaccent-100 dark:from-scaccent-900/20 dark:to-scaccent-800/20 rounded-2xl border border-scaccent-200 dark:border-scaccent-800">
          <p className="text-lg text-scprimary-600 dark:text-scwhite-200 font-medium">
            {__('Join thousands who\'ve made MoonlitMeadow their trusted shopping destination.', 'site-core')}
            <span className="block mt-2 text-scaccent-600 dark:text-scaccent-400">{__('We\'re here to serve you, every single day.', 'site-core')}</span>
          </p>
        </div>

      </div>
    </section>
  );
};

export default ContentBlock;