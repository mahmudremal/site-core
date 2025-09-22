import React, { useState, useEffect } from 'react';
import { X, Calendar, ExternalLink, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

export default function SinglePortfolio({ portfolio_id, isOpen, onClose }) {
  const [popupfolio, setPopupfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (portfolio_id && isOpen) {
      setLoading(true);
      fetch(`http://core.agency.local/wp-json/sitecore/v1/portfolios/${portfolio_id}`)
        .then(res => res.json())
        .then(res => {
          setPopupfolio(res);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch portfolio:', err);
          setLoading(false);
          // Mock data for demo purposes
          setPopupfolio({
            title: "Arizona Big Game Hunt Research Tool",
            role: "Full-stack Developer",
            description: "Huntarizona is a well known site around Arizona's hunting people. They sell different products those will be useful to hunt on Arizona. such as bags, weapons, etc. But their major and key service is the license to hunts over Arizona region.\n\nThen one day they came to me for a draw tools, that is actually hunt research tools. People use this tool to research which species will be found on which area, success probability etc. Yeah, a very good, effective and complex application that shows analytics from millions of data.\n\nClient appreciated the outcome and it's now running from 500$ subscription.",
            skills: ["React", "WordPress", "REST API", "Plugin Development", "Tailwind CSS"],
            published_date: "Sep 3, 2025",
            images: [
              { url: "/api/placeholder/800/600", caption: "After install the plugin. Blank Research Data", alt: "Blank research data interface" },
              { url: "/api/placeholder/800/600", caption: "Very Simple & Straight Configuration", alt: "Configuration interface" },
              { url: "/api/placeholder/800/600", caption: "One Click Imports", alt: "Import functionality" },
              { url: "/api/placeholder/800/600", caption: "Extensive and wide range data import (literally millions of data)", alt: "Data import interface" },
              { url: "/api/placeholder/800/600", caption: "Alternative PDF imports. Those PDF published from Arizona Big Game Department.", alt: "PDF import feature" },
              { url: "/api/placeholder/800/600", caption: "Column mapping and data moderation capabilities", alt: "Data moderation interface" },
              { url: "/api/placeholder/800/600", caption: "Subscription based research tools. Restriction page for non login users.", alt: "Subscription interface" },
              { url: "/api/placeholder/800/600", caption: "A nicely designed theme following the site.", alt: "Main interface design" },
            ]
          });
        });
    }
  }, [portfolio_id, isOpen]);

  const nextImage = () => {
    if (popupfolio?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % popupfolio.images.length);
    }
  };

  const prevImage = () => {
    if (popupfolio?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + popupfolio.images.length) % popupfolio.images.length);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="xpo_fixed xpo_inset-0 xpo_z-50 xpo_overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_bg-opacity-50" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="xpo_flex xpo_min-h-screen xpo_items-center xpo_justify-center xpo_p-4">
        <div className="xpo_relative xpo_w-full xpo_max-w-6xl xpo_bg-white xpo_rounded-lg xpo_shadow-xl xpo_max-h-screen xpo_overflow-hidden">
          
          {/* Header */}
          <div className="xpo_sticky xpo_top-0 xpo_z-10 xpo_bg-white xpo_border-b xpo_border-gray-200 xpo_px-6 xpo_py-4">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_m-0">
                {loading ? 'Loading...' : popupfolio?.title}
              </h2>
              <button 
                onClick={onClose}
                className="xpo_p-2 xpo_hover:bg-gray-100 xpo_rounded-full xpo_transition-colors"
              >
                <X className="xpo_w-6 xpo_h-6" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-20">
              <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-600"></div>
            </div>
          ) : popupfolio ? (
            <div className="xpo_flex xpo_flex-col lg:xpo_flex-row xpo_h-full">
              
              {/* Sidebar */}
              <div className="xpo_w-full lg:xpo_w-1/3 xpo_bg-gray-50 xpo_p-6 xpo_border-r xpo_border-gray-200">
                <div className="xpo_sticky xpo_top-6">
                  <div className="xpo_mb-4">
                    <span className="xpo_text-sm xpo_text-gray-500">My role.</span>
                    <p className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mt-1">
                      {popupfolio.role}
                    </p>
                  </div>

                  <div className="xpo_mb-6">
                    <span className="xpo_text-sm xpo_text-gray-500">Project description.</span>
                    <p className="xpo_text-gray-700 xpo_mt-2 xpo_whitespace-pre-line xpo_leading-relaxed">
                      {popupfolio.description}
                    </p>
                  </div>

                  {popupfolio.skills && (
                    <div className="xpo_mb-6">
                      <p className="xpo_text-sm xpo_text-gray-500 xpo_mb-3">Skills and deliverables</p>
                      <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
                        {popupfolio.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="xpo_px-3 xpo_py-1 xpo_bg-blue-100 xpo_text-blue-800 xpo_text-sm xpo_rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {popupfolio.published_date && (
                    <div className="xpo_mb-4">
                      <small className="xpo_text-gray-500 xpo_flex xpo_items-center">
                        <Calendar className="xpo_w-4 xpo_h-4 xpo_mr-1" />
                        Published on {popupfolio.published_date}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="xpo_flex-1 xpo_p-6 xpo_overflow-y-auto">
                {popupfolio.images && popupfolio.images.length > 0 && (
                  <div className="xpo_space-y-8">
                    {popupfolio.images.map((image, index) => (
                      <div key={index} className="xpo_bg-white xpo_rounded-lg xpo_shadow-sm xpo_overflow-hidden">
                        <div className="xpo_relative xpo_bg-gray-100">
                          <img 
                            src={image.url} 
                            alt={image.alt || image.caption}
                            className="xpo_w-full xpo_h-auto xpo_max-h-96 xpo_object-contain xpo_mx-auto"
                          />
                        </div>
                        {image.caption && (
                          <div className="xpo_p-4 xpo_text-center">
                            <span className="xpo_text-gray-600 xpo_text-sm">
                              {image.caption}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Share Section */}
                <div className="xpo_mt-8 xpo_pt-6 xpo_border-t xpo_border-gray-200">
                  <button className="xpo_flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-blue-700 xpo_transition-colors">
                    <Share2 className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                    Share Project
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-20">
              <p className="xpo_text-gray-500">Failed to load portfolio data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}