import React from 'react';
import { Link } from "react-router-dom";
import { Home, Users2, MailIcon, Settings2 } from 'lucide-react';

const Sidebar = () => {
  return (
    <div>
        <div className="xpo_flex xpo_flex-row md:xpo_flex-col md:xpo_h-screen xpo_bg-gray-800 xpo_text-white">
            <div className="xpo_flex xpo_p-4 xpo_bg-gray-900 xpo_w-1/5 md:xpo_w-full">
                <div className="xpo_flex xpo_items-center">
                    <img src="/assets/build/icons/brand/cursor-512.png" alt="Logo" className="xpo_w-8 xpo_h-8 xpo_mr-4 xpo_cursor-pointer" />
                </div>
            </div>
            <div className="xpo_w-4/5 md:xpo_w-full md:xpo_flex-1 xpo_overflow-y-auto md:xpo_flex">
                <nav>
                    <ul className="xpo_p-4 xpo_flex xpo_flex-nowrap md:xpo_flex-col md:xpo_flex-wrap">
                        <li className="xpo_py-2 xpo_flex xpo_items-center">
                            <Link to="/" className="hover:xpo_text-gray-300 xpo_flex xpo_items-center xpo_text-center md:xpo_text-auto xpo_p-2 md:xpo_p-0">
                                <Home className="xpo_w-5 xpo_h-5 xpo_mr-3" />
                                <span className="xpo_hidden md:xpo_inline">Home</span>
                            </Link>
                        </li>
                        <li className="xpo_py-2 xpo_flex xpo_items-center">
                            <Link to="/referrals" className="hover:xpo_text-gray-300 xpo_flex xpo_items-center xpo_text-center md:xpo_text-auto xpo_p-2 md:xpo_p-0">
                                <Users2 className="xpo_w-5 xpo_h-5 xpo_mr-3" />
                                <span className="xpo_hidden md:xpo_inline">Referrals</span>
                            </Link>
                        </li>
                        <li className="xpo_py-2 xpo_flex xpo_items-center">
                            <Link to="/contact" className="hover:xpo_text-gray-300 xpo_flex xpo_items-center xpo_text-center md:xpo_text-auto xpo_p-2 md:xpo_p-0">
                                <MailIcon className="xpo_w-5 xpo_h-5 xpo_mr-3" />
                                <span className="xpo_hidden md:xpo_inline">Contact</span>
                            </Link>
                        </li>
                        <li className="xpo_py-2 xpo_flex xpo_items-center">
                            <Link to="/settings" className="hover:xpo_text-gray-300 xpo_flex xpo_items-center xpo_text-center md:xpo_text-auto xpo_p-2 md:xpo_p-0">
                                <Settings2 className="xpo_w-5 xpo_h-5 xpo_mr-3" />
                                <span className="xpo_hidden md:xpo_inline">Settings</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;
