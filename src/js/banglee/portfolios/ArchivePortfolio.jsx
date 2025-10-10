import React, { useState, useEffect } from 'react';
import { Grid3X3, List, Star, Eye, ExternalLink, Calendar, User, Tag } from 'lucide-react';

export default function PortfolioGrid({ onPortfolioClick }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API call - replace with your actual API endpoint
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        // const response = await fetch('http://core.agency.local/wp-json/sitecore/v1/portfolios');
        // const data = await response.json();
        // setPortfolios(data);
        
        // Mock data for demo
        const mockData = [
          {
            id: 1,
            title: "E-Commerce App",
            category: "Mobile Application",
            description: "FUSCE MOLLIS SEM EU LIGULA ORNARE, UT MOLESTIE EROS VOLUTPAT. PRAESENT CONDIMENTUM, LIBERO ID TINCIDUNT TINCIDUNT, NEQUE EX ULTRICES PURUS, INTERDUM GRAVIDA ENIM SAPIEN AC URNA. CURABITUR ACCUMSAN DICTUM AUCTOR. ETIAM HENDRERIT TELLUS VEL RISUS MAXIMUS, EGET ELEIFEND SEM DICTUM.",
            client: "Manzone Shop",
            rating: 4.8,
            image: "/api/placeholder/600/400",
            tags: ["React Native", "E-commerce", "Mobile"],
            date: "2024-03-15"
          },
          {
            id: 2,
            title: "Arizona Big Game Hunt Research Tool",
            category: "Web Application",
            description: "Huntarizona is a well known site around Arizona's hunting people. They sell different products those will be useful to hunt on Arizona. But their major and key service is the license to hunts over Arizona region. A comprehensive research tool with analytics from millions of data.",
            client: "Hunt Arizona",
            rating: 5.0,
            image: "/api/placeholder/600/400",
            tags: ["React", "WordPress", "REST API", "Plugin Development"],
            date: "2024-02-20"
          },
          {
            id: 3,
            title: "Digital Marketing Dashboard",
            category: "Web Application",
            description: "A comprehensive dashboard for managing digital marketing campaigns, tracking performance metrics, and analyzing customer behavior. Built with modern technologies and responsive design principles.",
            client: "Marketing Pro",
            rating: 4.9,
            image: "/api/placeholder/600/400",
            tags: ["Vue.js", "Dashboard", "Analytics", "Charts"],
            date: "2024-01-10"
          },
          {
            id: 4,
            title: "Restaurant Management System",
            category: "Web & Mobile",
            description: "Complete restaurant management solution with order tracking, inventory management, staff scheduling, and customer relationship management. Includes both web admin panel and mobile app.",
            client: "Foodie Chain",
            rating: 4.7,
            image: "/api/placeholder/600/400",
            tags: ["React", "React Native", "Node.js", "MongoDB"],
            date: "2023-12-05"
          }
        ];
        setPortfolios(mockData);
      } catch (error) {
        console.error('Failed to fetch portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`xpo_w-4 xpo_h-4 ${
          index < Math.floor(rating) 
            ? 'xpo_text-yellow-400 xpo_fill-current' 
            : 'xpo_text-gray-300'
        }`}
      />
    ));
  };

  const PortfolioCard = ({ portfolio, index, isGrid = false }) => {
    const isEven = index % 2 === 0;
    
    if (isGrid) {
      return (
        <div 
          className="xpo_bg-white xpo_rounded-xl xpo_shadow-lg xpo_overflow-hidden xpo_hover:shadow-xl xpo_transition-all xpo_duration-300 xpo_cursor-pointer xpo_group"
          onClick={() => onPortfolioClick(portfolio.id)}
        >
          <div className="xpo_relative xpo_overflow-hidden">
            <img 
              src={portfolio.image} 
              alt={portfolio.title}
              className="xpo_w-full xpo_h-48 xpo_object-cover xpo_group-hover:scale-105 xpo_transition-transform xpo_duration-300"
            />
            <div className="xpo_absolute xpo_top-4 xpo_right-4">
              <span className="xpo_bg-black xpo_bg-opacity-70 xpo_text-white xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-xs">
                {portfolio.category}
              </span>
            </div>
            <div className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-0 xpo_group-hover:bg-opacity-20 xpo_transition-all xpo_duration-300 xpo_flex xpo_items-center xpo_justify-center">
              <Eye className="xpo_w-8 xpo_h-8 xpo_text-white xpo_opacity-0 xpo_group-hover:opacity-100 xpo_transition-opacity xpo_duration-300" />
            </div>
          </div>
          
          <div className="xpo_p-6">
            <div className="xpo_mb-3">
              <span className="xpo_text-sm xpo_text-blue-600 xpo_font-medium">{portfolio.category}</span>
              <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mt-1 xpo_group-hover:text-blue-600 xpo_transition-colors">
                {portfolio.title}
              </h3>
            </div>
            
            <p className="xpo_text-gray-600 xpo_text-sm xpo_mb-4 xpo_line-clamp-3">
              {portfolio.description}
            </p>
            
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
              <div className="xpo_flex xpo_items-center">
                <User className="xpo_w-4 xpo_h-4 xpo_text-gray-400 xpo_mr-2" />
                <span className="xpo_text-sm xpo_text-gray-600">{portfolio.client}</span>
              </div>
              <div className="xpo_flex xpo_items-center">
                <span className="xpo_text-sm xpo_text-gray-600 xpo_mr-1">({portfolio.rating})</span>
                <div className="xpo_flex">{renderStars(portfolio.rating)}</div>
              </div>
            </div>
            
            <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
              {portfolio.tags.slice(0, 3).map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  className="xpo_px-2 xpo_py-1 xpo_bg-gray-100 xpo_text-gray-600 xpo_text-xs xpo_rounded-md"
                >
                  {tag}
                </span>
              ))}
              {portfolio.tags.length > 3 && (
                <span className="xpo_text-xs xpo_text-gray-400">+{portfolio.tags.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="xpo_bg-white xpo_rounded-xl xpo_shadow-lg xpo_overflow-hidden xpo_mb-8 xpo_hover:shadow-xl xpo_transition-all xpo_duration-300 xpo_cursor-pointer xpo_group"
        onClick={() => onPortfolioClick(portfolio.id)}
      >
        <div className={`xpo_flex xpo_flex-col lg:xpo_flex-row ${!isEven ? 'lg:xpo_flex-row-reverse' : ''}`}>
          {/* Image Section */}
          <div className="xpo_w-full lg:xpo_w-1/2 xpo_relative xpo_overflow-hidden">
            <img 
              src={portfolio.image} 
              alt={portfolio.title}
              className="xpo_w-full xpo_h-64 lg:xpo_h-full xpo_object-cover xpo_group-hover:scale-105 xpo_transition-transform xpo_duration-300"
            />
            <div className="xpo_absolute xpo_top-4 xpo_right-4">
              <span className="xpo_bg-black xpo_bg-opacity-70 xpo_text-white xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-sm">
                {portfolio.category}
              </span>
            </div>
            <div className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-0 xpo_group-hover:bg-opacity-20 xpo_transition-all xpo_duration-300 xpo_flex xpo_items-center xpo_justify-center">
              <Eye className="xpo_w-12 xpo_h-12 xpo_text-white xpo_opacity-0 xpo_group-hover:opacity-100 xpo_transition-opacity xpo_duration-300" />
            </div>
          </div>
          
          {/* Content Section */}
          <div className="xpo_w-full lg:xpo_w-1/2 xpo_p-8 xpo_flex xpo_flex-col xpo_justify-center">
            <div className="xpo_mb-4">
              <span className="xpo_text-sm xpo_text-blue-600 xpo_font-medium xpo_uppercase xpo_tracking-wide">
                PROJECT CATEGORY
              </span>
              <h3 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mt-2 xpo_group-hover:text-blue-600 xpo_transition-colors">
                {portfolio.title}
              </h3>
            </div>
            
            <div className="xpo_mb-6">
              <span className="xpo_text-sm xpo_text-gray-500 xpo_uppercase xpo_tracking-wide xpo_mb-2 xpo_block">
                SHORT DESCRIPTION
              </span>
              <p className="xpo_text-gray-700 xpo_leading-relaxed xpo_mb-4">
                {portfolio.description}
              </p>
            </div>
            
            <div className="xpo_mb-6">
              <span className="xpo_text-sm xpo_text-gray-500 xpo_uppercase xpo_tracking-wide xpo_mb-2 xpo_block">
                CLIENT
              </span>
              <h4 className="xpo_text-xl xpo_font-semibold xpo_text-yellow-600 xpo_mb-3">
                {portfolio.client}
              </h4>
              
              <div className="xpo_flex xpo_items-center xpo_mb-4">
                <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mr-2">
                  ({portfolio.rating})
                </span>
                <div className="xpo_flex xpo_mr-4">{renderStars(portfolio.rating)}</div>
                <button className="xpo_text-yellow-600 xpo_hover:text-yellow-700 xpo_font-medium xpo_text-sm xpo_border-b xpo_border-yellow-600 xpo_hover:border-yellow-700 xpo_transition-colors">
                  Showcase
                </button>
              </div>
            </div>
            
            <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
              {portfolio.tags.map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  className="xpo_px-3 xpo_py-1 xpo_bg-blue-100 xpo_text-blue-800 xpo_text-sm xpo_rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-20">
        <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="xpo_container xpo_mx-auto xpo_px-4 xpo_py-8">
      {/* Header with View Toggle */}
      <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-8">
        <div>
          <h2 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900">My Portfolio</h2>
          <p className="xpo_text-gray-600 xpo_mt-2">Showcase of my recent projects and work</p>
        </div>
        
        <div className="xpo_flex xpo_items-center xpo_bg-gray-100 xpo_rounded-lg xpo_p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`xpo_flex xpo_items-center xpo_px-4 xpo_py-2 xpo_rounded-md xpo_transition-all xpo_duration-200 ${
              viewMode === 'list'
                ? 'xpo_bg-white xpo_text-gray-900 xpo_shadow-sm'
                : 'xpo_text-gray-500 xpo_hover:text-gray-700'
            }`}
          >
            <List className="xpo_w-4 xpo_h-4 xpo_mr-2" />
            List View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`xpo_flex xpo_items-center xpo_px-4 xpo_py-2 xpo_rounded-md xpo_transition-all xpo_duration-200 ${
              viewMode === 'grid'
                ? 'xpo_bg-white xpo_text-gray-900 xpo_shadow-sm'
                : 'xpo_text-gray-500 xpo_hover:text-gray-700'
            }`}
          >
            <Grid3X3 className="xpo_w-4 xpo_h-4 xpo_mr-2" />
            Grid View
          </button>
        </div>
      </div>

      {/* Portfolio Content */}
      {viewMode === 'grid' ? (
        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xl:xpo_grid-cols-3 xpo_gap-8">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard 
              key={portfolio.id} 
              portfolio={portfolio} 
              index={index} 
              isGrid={true}
            />
          ))}
        </div>
      ) : (
        <div className="xpo_space-y-0">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard 
              key={portfolio.id} 
              portfolio={portfolio} 
              index={index} 
              isGrid={false}
            />
          ))}
        </div>
      )}

      {portfolios.length === 0 && !loading && (
        <div className="xpo_text-center xpo_py-20">
          <p className="xpo_text-gray-500">No portfolios found.</p>
        </div>
      )}
    </div>
  );
}