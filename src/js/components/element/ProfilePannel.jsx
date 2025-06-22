import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@common/link';
import { useAuth } from "@context/AuthProvider";
import { useSession } from "@context/SessionProvider";
import { useTranslation } from "@context/LanguageProvider";
import { createPopper } from '@popperjs/core';
import { Cross, MailCheck, Power, Settings, User } from 'lucide-react';
import { get_user_role, home_url } from '@functions';

export default function ProfilePannel() {
    const { logout } = useAuth();
    const { session } = useSession();
    const { __ } = useTranslation();
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
            modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
            ],
        });
        }
    }, [menuOpened]);

    const user = session?.user;

    return (
        <div className="dropdown">
            <button
                type="button"
                ref={buttonRef}
                onClick={toggleDropdown}
                aria-expanded={menuOpened ? 'true' : 'false'}
                className={`flex xpo_justify-content-center xpo_items-center rounded-circle ${menuOpened ? 'show' : ''}`}
            >
                <div className="relative">
                    <img src={ user?.avater??'' } alt="image" className="w-40-px xpo_h-40-px object-fit-cover rounded-circle" />
                    <div className="absolute top-0 right-0 xpo_w-full xpo_h-full"></div>
                </div>
            </button>
            
            {menuOpened && <div className="fixed top-0 left-0 xpo_w-full xpo_h-full z-10" onClick={(e) => setMenuOpened(false)}></div>}
            
            <div ref={dropdownRef} className={`dropdown-menu to-top dropdown-menu-sm z-10 ${menuOpened ? 'show block' : ''}`}>
                <div className="py-12 px-16 radius-8 bg-primary-50 xpo_mb-16 flex xpo_items-center xpo_justify-between xpo_gap-2">
                    <div>
                        <h6 className="text-lg xpo_text-primary-light fw-semibold xpo_mb-2">{[user?.firstName??'', user?.lastName??''].join(' ')}</h6>
                        <span className="text-secondary-light fw-medium xpo_text-sm">{__(get_user_role(user))}</span>
                    </div>
                    <button type="button" className="hover-text-danger">
                        <Cross className="icon xpo_text-xl" />
                    </button>
                </div>
                <ul className="to-top-list">
                    <li>
                        <Link to={ home_url(`/users/${user?.id??''}/view`) } className="dropdown-item xpo_text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-primary flex xpo_items-center xpo_gap-3"> 
                        <User className="icon xpo_text-xl" />  {__('My Profile')}</Link>
                    </li>
                    <li>
                        <Link to={ home_url('/notifications') } className="dropdown-item xpo_text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-primary flex xpo_items-center xpo_gap-3"> 
                        <MailCheck className="icon xpo_text-xl" />  {__('Notifications')}</Link>
                    </li>
                    <li>
                        <Link to={ home_url('/settings') } className="dropdown-item xpo_text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-primary flex xpo_items-center xpo_gap-3"> 
                        <Settings className="icon xpo_text-xl" />  {__('Setting')}</Link>
                    </li>
                    <li>
                        <button
                            onClick={logout}
                            className="dropdown-item xpo_text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-danger flex xpo_items-center xpo_gap-3"
                        > 
                        <Power className="icon xpo_text-xl" />  {__('Log Out')}</button>
                    </li>
                </ul>
            </div>
        </div>
    );
}