import React, { useEffect, useState } from 'react';
// import { Link } from '../common/link';
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@context/AuthProvider";
import { useTranslation } from "@context/LanguageProvider";


import { BookMarked, BookOpenText, Boxes, ChevronRight, CreditCard, Database, HeartHandshake, LayoutDashboard, Network, Receipt, Signature, Store, Users, UsersRound } from 'lucide-react';
import { home_route, roles } from '@functions';

export const Nav = () => {
  const { auth } = useAuth();
  const { __ } = useTranslation();

  const [navMenus, setNavMenus] = useState([]);

  useEffect(() => {
    // auth ? [] : 
    setNavMenus(prev => [
      {
        label: __('Dashboard'),
        icon: LayoutDashboard,
        route: '/analytics',
        order: 0,
        caps: ['project_manager', 'read'],
        // childrens: [
        //   {
        //     label: __('Analytics'),
        //     route: '/analytics',
        //     icon: ChartNoAxesCombined,
        //     caps: ['read']
        //   },
        //   {
        //     label: __('Sales'),
        //     route: '/sales',
        //     icon: ChartSpline,
        //     caps: ['project_manager']
        //   }
        // ]
      },
      {
        label: __('Sites'),
        order: 1,
        caps: ['read'],
        class: 'sidebar-menu-group-title'
      },
      {
        label: __('Sites'),
        icon: Database,
        route: '/sites',
        order: 1,
        caps: ['read']
      },
      {
        label: __('Application'),
        order: 1,
        caps: ['read'],
        class: 'sidebar-menu-group-title'
      },
      {
        label: __('Users'),
        icon: Users,
        route: '/users',
        order: 3,
        caps: ['project_manager', 'users'],
        // childrens: [
        //   {
        //     label: __('Users List'),
        //     route: '/users',
        //     icon: LayoutList,
        //     iconClass: 'text-primary-600'
        //   },
        //   {
        //     label: __('Add User'),
        //     route: '/users/0/edit',
        //     icon: UserRoundPlus,
        //     iconClass: 'text-info-main'
        //   }
        // ]
      },
      {
        label: __('Stores'),
        icon: Store,
        route: '/stores',
        order: 4,
        caps: ['stores'],
      },
      {
        label: __('Referrals'),
        icon: Network,
        route: '/referrals',
        order: 5,
        caps: ['referral'],
        // childrens: [
        //   {
        //     label: __('Active referrals'),
        //     route: '/referrals/active',
        //     icon: ToggleRight
        //   },
        //   {
        //     label: __('Inactive referrals'),
        //     route: '/referrals/inactive',
        //     icon: ToggleLeft
        //   },
        //   // {
        //   //   label: __('Retargetting'),
        //   //   route: '/referrals/retargetting',
        //   //   icon: Crosshair
        //   // }
        // ]
      },
      {
        label: __('Contracts'),
        icon: Signature,
        route: '/contracts',
        order: 6,
        caps: ['contracts'],
        // childrens: [
        //   {
        //     label: __('Active contracts'),
        //     route: '/contracts/active',
        //     icon: ToggleRight
        //   },
        //   {
        //     label: __('Previous contracts'),
        //     route: '/contracts/archive',
        //     icon: ChevronFirst
        //   }
        // ]
      },
      {
        label: __('Packages'),
        icon: Boxes,
        route: '/packages',
        order: 7,
        caps: ['packages'],
      },
      {
        label: __('Invoices'),
        icon: Receipt,
        route: '/invoices',
        order: 7,
        caps: ['invoices'],
      },
      {
        label: __('Resources'),
        order: 8,
        caps: ['partner-docs', 'service-docs', 'support-ticket'],
        class: 'sidebar-menu-group-title'
      },
      {
        label: __('Partner docs'),
        icon: BookMarked,
        route: '/resources/partner-docs',
        order: 9,
        caps: ['partner-docs'],
      },
      {
        label: __('Service docs'),
        icon: BookOpenText,
        route: '/resources/service-docs',
        order: 10,
        caps: ['service-docs'],
      },
      {
        label: __('Support'),
        icon: HeartHandshake,
        route: '/support/supports',
        order: 11,
        caps: ['support-ticket'],
        // childrens: [
        //   {
        //     label: __('Supports'),
        //     route: '/support/supports',
        //     icon: LifeBuoy
        //   },
        //   {
        //     label: __('Open Ticket'),
        //     route: '/support/open-ticket',
        //     icon: TicketPlus
        //   }
        // ]
      },
      {
        label: __('Admin'),
        order: 12,
        caps: ['payouts', 'team'],
        class: 'sidebar-menu-group-title'
      },
      {
        label: __('Payouts'),
        icon: CreditCard,
        route: '/payouts',
        order: 13,
        caps: ['payouts'],
      },
      {
        label: __('Team'),
        icon: UsersRound,
        route: '/team',
        order: 14,
        caps: ['team'],
      },
      // {
      //   label: __('Settings'),
      //   icon: Bolt,
      //   route: '/settings',
      //   order: 15,
      //   caps: ['read'],
      // }
    ]);
  }, [auth]);
  
  return (
    <>
      <Outlet />
        {/* // location.host !== 'core.ecommerized.com' ? r :
        // (
        //   // , '/resources/service-docs', '/resources/partner-docs', '/packages', '/stores', '/support', '/contracts'
        //   !['/users', '/invoices', '/team', '/settings'].includes(r.route)
        //   && ! ['sidebar-menu-group-title'].includes(r?.class)
        // ) */}
      <ul className="sidebar-menu" id="sidebar-menu">
        {navMenus
        // .map(r => ({...r, childrens: (r?.childrens??[]).filter(i => roles.has_ability(i?.caps))})).filter(r => roles.has_ability(r?.caps))
        .map((item, index) => <NavItem key={index} item={item} />)}
      </ul>
    </>
  );
};

const NavItem = ({ item }) => {
  const [open, setOpen] = useState(false);

  if (item.class === 'sidebar-menu-group-title') {
    return <li className={item.class}>{item.label}</li>;
  }

  const hasChildren = item.childrens && item.childrens.length > 0;

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  return (
    <li className={`${hasChildren ? 'dropdown' : ''} ${open ? '' : ''}`}>
      <NavLink to={home_route(item.route??'#')} onClick={hasChildren ? toggleDropdown : undefined} className={({ isActive }) => isActive ? 'active-page' : ''}>
        {item.icon && <Icon icon={item.icon} className="menu-icon" />}
        <span>{item.label}</span>
        {hasChildren && <ChevronRight />}
      </NavLink>

      {hasChildren && (
        <ul className="sidebar-submenu" style={{ display: open ? 'block' : 'none' }}>
          {item.childrens.map((child, idx) => (
            <li key={idx} className="cursor-pointer">
              <NavLink to={home_route(child.route)} className={({ isActive }) => isActive ? 'active-page' : ''}>
                {child.icon && <Icon icon={child.icon} className="menu-icon" />}
                {!child.icon && child.iconClass && (
                  <i className={`ri-circle-fill circle-icon ${child.iconClass} xpo_w-auto`} />
                )}
                <span>{child.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Icon = ({ icon: IconComponent, ...attrs }) => {
  return <IconComponent {...attrs} />;
};
