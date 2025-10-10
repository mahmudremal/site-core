import { useEffect } from 'react';
import { Shield, Clock, Headphones, TrendingUp } from 'lucide-react';

const ContentBlock = ({ content = null, onLoaded = null }) => {
  const defaultContent = {
    headline: "Your Trusted Shopping Partner in Bangladesh",
    description: "At MoonlitMeadow, we've built more than just an online store. We've created a reliable destination where thousands of customers find quality products, honest service, and peace of mind with every purchase.",
    stats: [
      { number: "50,000+", label: "Happy Customers" },
      { number: "99.2%", label: "On-Time Delivery" },
      { number: "24/7", label: "Customer Support" },
      { number: "10,000+", label: "Products Available" }
    ],
    commitments: [
      {
        icon: Shield,
        title: "Secure & Verified",
        text: "Every transaction is protected. Every product is authenticated. Shop with complete confidence."
      },
      {
        icon: Clock,
        title: "Transparent Process",
        text: "Place your order, we verify and confirm, pack it carefully, and deliver to your doorstep. You'll know exactly where your order is at every step."
      },
      {
        icon: Headphones,
        title: "Always Here for You",
        text: "Questions? Concerns? Our dedicated support team is ready to assist you whenever you need us."
      },
      {
        icon: TrendingUp,
        title: "Growing With You",
        text: "We're constantly expanding our collection and improving our service based on what you, our valued customers, tell us you need."
      }
    ]
  };

  useEffect(() => onLoaded && onLoaded(), [onLoaded]);
  
  const block = content || defaultContent;

  return (
    // xpo_bg-scwhite-200 dark:xpo_bg-scprimary-900
    <section className="xpo_py-20 xpo_px-4">
      <div className="xpo_max-w-6xl xpo_mx-auto">
        
        {/* Trust Statement */}
        <div className="xpo_text-center xpo_mb-16 xpo_max-w-3xl xpo_mx-auto">
          <h2 className="xpo_text-3xl md:xpo_text-4xl xpo_font-bold xpo_text-scprimary-600 dark:xpo_text-scwhite-100 xpo_mb-6 xpo_leading-tight">
            {block.headline}
          </h2>
          <p className="xpo_text-lg xpo_text-scprimary-400 dark:xpo_text-scwhite-600 xpo_leading-relaxed">
            {block.description}
          </p>
        </div>

        {/* Statistics Bar */}
        <div className="xpo_grid xpo_grid-cols-2 md:xpo_grid-cols-4 xpo_gap-6 xpo_mb-16 xpo_bg-scwhite-100 dark:xpo_bg-scprimary-800 xpo_rounded-2xl xpo_p-8 xpo_shadow-sm xpo_border xpo_border-scwhite-500 dark:xpo_border-scprimary-700">
          {block.stats.map((stat, index) => (
            <div key={index} className="xpo_text-center">
              <div className="xpo_text-3xl md:xpo_text-4xl xpo_font-bold xpo_text-scaccent-500 dark:xpo_text-scaccent-400 xpo_mb-2">
                {stat.number}
              </div>
              <div className="xpo_text-sm xpo_text-scprimary-400 dark:xpo_text-scwhite-600 xpo_font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Commitments Grid */}
        <div className="xpo_grid md:xpo_grid-cols-2 xpo_gap-8">
          {block.commitments.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="xpo_flex xpo_gap-5 xpo_p-6 xpo_bg-scwhite-100 dark:xpo_bg-scprimary-800 xpo_rounded-xl xpo_border xpo_border-scwhite-500 dark:xpo_border-scprimary-700 xpo_transition-all xpo_duration-300 hover:xpo_border-scaccent-400 dark:hover:xpo_border-scaccent-600"
              >
                <div className="xpo_flex-shrink-0">
                  <div className="xpo_w-12 xpo_h-12 xpo_bg-scaccent-100 dark:xpo_bg-scaccent-900/30 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center">
                    <Icon className="xpo_w-6 xpo_h-6 xpo_text-scaccent-600 dark:xpo_text-scaccent-400" />
                  </div>
                </div>
                <div>
                  <h3 className="xpo_text-lg xpo_font-semibold xpo_text-scprimary-600 dark:xpo_text-scwhite-100 xpo_mb-2">
                    {item.title}
                  </h3>
                  <p className="xpo_text-scprimary-400 dark:xpo_text-scwhite-600 xpo_leading-relaxed xpo_text-sm">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Message */}
        <div className="xpo_mt-12 xpo_text-center xpo_py-8 xpo_px-6 xpo_bg-gradient-to-r xpo_from-scaccent-50 xpo_to-scaccent-100 dark:xpo_from-scaccent-900/20 dark:xpo_to-scaccent-800/20 xpo_rounded-2xl xpo_border xpo_border-scaccent-200 dark:xpo_border-scaccent-800">
          <p className="xpo_text-lg xpo_text-scprimary-600 dark:xpo_text-scwhite-200 xpo_font-medium">
            Join thousands who've made MoonlitMeadow their trusted shopping destination. 
            <span className="xpo_block xpo_mt-2 xpo_text-scaccent-600 dark:xpo_text-scaccent-400">We're here to serve you, every single day.</span>
          </p>
        </div>

      </div>
    </section>
  );
};

export default ContentBlock;