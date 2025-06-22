import React, { useEffect, useState } from 'react';
import { Nav } from '@components/sidebar/nav';
import { Link } from '@common/link';
import { home_url, roles } from '@functions';
import Footer from '@components/element/Footer';
import { ChevronRight, Menu, MoonStar, Search, SunMedium, X } from 'lucide-react';
import LanguageSwitcher from '@components/element/LanguageSwitcher';
import Notifications from '@components/element/Notifications';
import { useTranslation } from '@context/LanguageProvider';
import ProfilePannel from '@components/element/ProfilePannel';
import { useTheme } from '@context/ThemeProvider';

import logo from '@img/logo.png';
import logoIcon from '@img/logo-icon.png';
import logoLight from '@img/logo-light.png';
import Breadcrumb from '@components/sidebar/breadcrumb';

const is_mobile_width = () => {return window.innerWidth <= 1200;}

const MainLayout = ({ children }) => {
    const { __ } = useTranslation();
    const { theme, switchTheme } = useTheme();
    
    const [opened, setOpened] = useState(false);
    const [miniSidebar, setMiniSidebar] = useState(false);
    
    useEffect(() => {
        if (opened) {
            document.body.classList.add('overlay-active');
        } else {
            document.body.classList.remove('overlay-active');
        }

        const handleResize = () => {
            if (opened) {
                document.body.classList.add('overlay-active');
            } else {
                document.body.classList.remove('overlay-active');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.classList.remove('overlay-active');
        };
    }, [opened]);

    return (
        <section className="xpo_w-full xpo_flex xpo_gap-2">
            {/* sidebar sidebar-open */}
            <aside className={ `sidebar ${miniSidebar ? 'active' : ''} ${opened ? 'sidebar-open' : ''}` }>
                <button type="button" className="sidebar-close-btn" onClick={(e) => is_mobile_width() ? setOpened(false) : setMiniSidebar(false)}>
                    <X />
                </button>
                <div>
                    <Link to={ home_url('/') } className="sidebar-logo">
                        <img src={ logo } alt={__('Site logo')} className="light-logo" />
                        <img src={ logoLight } alt={__('Site logo')} className="dark-logo" />
                        <img src={ logoIcon } alt={__('Site logo')} className="logo-icon" />
                    </Link>
                </div>
                <div className="sidebar-menu-area">
                    <Nav />
                </div>
            </aside>
            <main className={ `dashboard-main xpo_relative ${miniSidebar ? 'active' : null}` }>
                <div className="navbar-header">
                    <div className="row xpo_items-center xpo_justify-content-between">
                        <div className="col-auto">
                            <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_gap-4">
                                <button type="button" className={ `sidebar-toggle ${miniSidebar ? 'active' : null}` } onClick={(e) => setMiniSidebar(prev => !prev)}>
                                    <Menu className="icon xpo_text-2xl non-active" />
                                    <ChevronRight className="icon xpo_text-2xl active" />
                                </button>
                                <button type="button" className="sidebar-mobile-toggle" onClick={(e) => setOpened(prev => !prev)}>
                                    <Menu className="icon" />
                                </button>
                                <form className="navbar-search">
                                    <input type="text" name="search" placeholder={__('Search')} />
                                    <Search className="icon" />
                                </form>
                            </div>
                        </div>
                        <div className="col-auto">
                            <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_gap-3">

                                <button type="button" data-theme-toggle className="w-40-px xpo_h-40-px bg-neutral-200 rounded-circle xpo_flex xpo_justify-content-center xpo_items-center" onClick={switchTheme}>
                                    {theme === 'dark' ? <MoonStar /> : <SunMedium />}
                                </button>
                                {/*  */}
                                <LanguageSwitcher />
                                {/* <MessageNotification /> */}
                                {roles.has_ability('notifications') && <Notifications />}
                                <ProfilePannel />
                                {/*  */}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-main-body xpo_h-[calc(100vh-72px*2)] xpo_overflow-hidden xpo_overflow-y-scroll">
                    <Breadcrumb />
                    {/* Main section will be placed here */}
                    <div>
                        {children}
                    </div>
                    {/* end of main section */}

                </div>

                <Footer />
                
                {opened ? <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_bg-slate-600 xpo_opacity-50 xpo_cursor-auto" onClick={(e) => setOpened(prev => !prev)}></div> : null}
            </main>
        </section>
    );
};
export default MainLayout;
