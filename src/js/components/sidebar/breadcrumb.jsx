import { Home } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { home_url } from '@functions';

const _routes = [
  { route: '/insights', label: 'Insights' },
  { route: '/users', label: 'Users' },
  { route: '/stores', label: 'Stores' },
  { route: '/referrals', label: 'Referrals' },
  { route: '/referrals/active', label: 'Active referrals' },
  { route: '/referrals/inactive', label: 'Inactive referrals' },
  { route: '/resources/partner-docs', label: 'Partner Docs' },
  { route: '/resources/partner-docs/:category', label: 'Partner Docs Category', dynamic: true },
  { route: '/resources/partner-docs/:category/:slug', label: 'Partner Docs Single', dynamic: true },
  { route: '/resources/service-docs', label: 'Service Docs' },
  { route: '/resources/service-docs/:category', label: 'Service Docs Category', dynamic: true },
  { route: '/resources/service-docs/:category/:slug', label: 'Service Docs Single', dynamic: true },
  { route: '/support', label: 'Support' },
  { route: '/support/tickets', label: 'Tickets' },
  { route: '/support/open-ticket', label: 'Open Ticket' },
  { route: '/contracts/active', label: 'Active Contracts' },
  { route: '/contracts/inactive', label: 'Inactive Contracts' },
  { route: '/packages', label: 'Packages' },
  { route: '/packages/checkout', label: 'Checkout' },
  { route: '/invoices', label: 'Invoices' },
  { route: '/invoices/:invoiceid/edit', label: 'Edit Invoice' },
  { route: '/settings', label: 'Settings' },
  { route: '/payouts', label: 'Payouts' },
  { route: '/team', label: 'Teams' },
];

const Breadcrumb = () => {
  const location = useLocation();
  const { pathname } = location;

  const segments = pathname.split('/').filter(Boolean).filter(s => s !== 'partnership-dashboard');

  // Get full path for each segment step
  const allPaths = segments.map((_, index) => '/' + segments.slice(0, index + 1).join('/'));


  // Utility to match a path against a dynamic route pattern
    const findRouteMatch = (path) => {
        return _routes.find(({ route }) => {
            const pattern = '^' + route.replace(/:[^/]+/g, '[^/]+') + '$';
            
            const matches = new RegExp(pattern).test(path);
            return matches;
        });
    };

  // Build breadcrumb items by matching routes
  const breadcrumbItems = allPaths
    .map(path => {
        const match = findRouteMatch(path);
        if (match && match.dynamic) {
            console.log(match);
            // match.label = 'Is from dynamic'
        }
        return match ? { path, label: match.label } : null;
    })
    .filter(Boolean); // Remove nulls (invalid segments like 'partnership-dashboard')

  return (
    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3 xpo_mb-24">
      <h6 className="fw-semibold xpo_mb-0">
        {breadcrumbItems.length === 0 ? 'Home' : breadcrumbItems[breadcrumbItems.length - 1].label}
      </h6>

      <ul className="xpo_flex xpo_items-center xpo_gap-2">
        <li className="fw-medium">
          <Link to={home_url('/')} className="xpo_flex xpo_items-center xpo_gap-1 hover-text-primary">
            <Home className="icon xpo_text-lg" />
            Home
          </Link>
        </li>

        {breadcrumbItems.length > 0 && <li>-</li>}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={item.path}>
              <li className="fw-medium">
                {isLast ? (
                  item.label
                ) : (
                  <Link to={home_url(item.path)} className="xpo_flex xpo_items-center xpo_gap-1 hover-text-primary">
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && <li>-</li>}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumb;
