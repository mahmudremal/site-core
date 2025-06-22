import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "@common/link";
import { timeAgo } from "@functions";
import { createPopper } from "@popperjs/core";
import { useTranslation } from "@context/LanguageProvider";
import { useNotifications } from "@context/NotificationsProvider";
import { Bell } from "lucide-react";

export default function Notifications() {
    const { __ } = useTranslation();
    const { notifications, pagination, setPage, fetchNotifications } = useNotifications();
    const [menuOpened, setMenuOpened] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
  
    const toggleDropdown = () => {
      setMenuOpened(prev => !prev);
    };
  
    useEffect(() => {
      if (menuOpened && buttonRef.current && dropdownRef.current) {
        createPopper(buttonRef.current, dropdownRef.current, {
            placement: 'bottom-end',
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
        });
      }
    }, [menuOpened]);
  
    return (
        <div className="dropdown">
            <button
                type="button"
                ref={buttonRef}
                onClick={toggleDropdown}
                aria-expanded={menuOpened ? 'true' : 'false'}
                className={`has-indicator xpo_w-40-px xpo_h-40-px bg-neutral-200 rounded-circle flex xpo_justify-content-center xpo_items-center ${menuOpened ? 'show' : ''}`}
            >
                <Bell className="text-primary-light xpo_text-xl" />
            </button>

            {menuOpened && <div className="fixed top-0 left-0 xpo_w-full xpo_h-full z-10" onClick={(e) => setMenuOpened(false)}></div>}

            <div ref={dropdownRef} className={`dropdown-menu to-top dropdown-menu-lg xpo_p-0 ${menuOpened ? 'show block' : ''}`}>
            <div className="m-16 py-12 px-16 radius-8 bg-primary-50 xpo_mb-16 flex xpo_items-center xpo_justify-between xpo_gap-2">
                <div>
                    <h6 className="text-lg xpo_text-primary-light fw-semibold xpo_mb-0">{__('Notifications')}</h6>
                </div>
                <span className="text-primary-600 fw-semibold xpo_text-lg xpo_w-40-px xpo_h-40-px rounded-circle bg-base flex xpo_justify-content-center xpo_items-center">{notifications?.length ?? 0}</span>
            </div>
    
            <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">
                {notifications.map((n, i) => (
                    <NotificationItem key={n.id || i} args={n} />
                ))}
            </div>
    
            {pagination?.totalPages > 1 && (
                <div className="text-center py-12 px-16">
                    <Link
                        to="#"
                        onClick={() => setPage(prev => (pagination?.nextPage ? pagination.nextPage : prev))}
                        className="text-primary-600 fw-semibold xpo_text-md"
                    >
                        {__('See All Notifications')}
                    </Link>
                </div>
            )}
            </div>
        </div>
    );
}
  
const NotificationItem = ({ args = {} }) => {
    const { to = "#", image, initials, icon, title, subtitle, created, bg = "", seen } = args;
    return (
        <Link to={to} className={`px-24 py-12 flex align-items-start xpo_gap-3 xpo_mb-2 xpo_justify-between ${!seen ? "bg-neutral-50" : ""}`}>
            <div className="text-black hover-bg-transparent hover-text-primary flex xpo_items-center xpo_gap-3">
                <span className={`w-44-px xpo_h-44-px ${bg} rounded-circle flex xpo_justify-content-center xpo_items-center xpo_flex-shrink-0`}>
                    {icon && <Icon icon={icon} className="icon xpo_text-xxl xpo_text-success-main" />}
                    {image && <img src={image} alt={title} className="rounded-full aspect-square" />}
                    {!image && !icon && initials}
                </span>
                <div>
                    <h6 className="text-md fw-semibold xpo_mb-4">{title}</h6>
                    <p className="mb-0 xpo_text-sm xpo_text-secondary-light xpo_text-w-200-px">{subtitle}</p>
                </div>
            </div>
            <span className="text-sm xpo_text-secondary-light xpo_flex-shrink-0">{timeAgo(created)}</span>
        </Link>
    );
};