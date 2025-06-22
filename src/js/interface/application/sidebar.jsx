import React from 'react';
import { Link } from "react-router-dom";
import { Home, Users2, MailIcon, Settings2 } from 'lucide-react';

const Sidebar = () => {
  return (
    <div>
        <div className="xpo_flex xpo_flex-row md:flex-col md:h-screen bg-gray-800 xpo_text-white">
            <div className="xpo_flex xpo_p-4 bg-gray-900 xpo_w-1/5 md:w-full">
                <div className="xpo_flex xpo_items-center">
                    <img src="/assets/build/icons/brand/cursor-512.png" alt="Logo" className="w-8 xpo_h-8 xpo_mr-4 cursor-pointer" />
                </div>
            </div>
            <div className="w-4/5 md:w-full md:flex-1 overflow-y-auto md:flex">
                <nav>
                    <ul className="p-4 flex xpo_flex-nowrap md:flex-col md:flex-wrap">
                        <li className="py-2 flex xpo_items-center">
                            <Link to="/" className="hover:text-gray-300 flex xpo_items-center xpo_text-center md:text-auto xpo_p-2 md:p-0">
                                <Home className="w-5 xpo_h-5 xpo_mr-3" />
                                <span className="hidden md:inline">Home</span>
                            </Link>
                        </li>
                        <li className="py-2 flex xpo_items-center">
                            <Link to="/referrals" className="hover:text-gray-300 flex xpo_items-center xpo_text-center md:text-auto xpo_p-2 md:p-0">
                                <Users2 className="w-5 xpo_h-5 xpo_mr-3" />
                                <span className="hidden md:inline">Referrals</span>
                            </Link>
                        </li>
                        <li className="py-2 flex xpo_items-center">
                            <Link to="/contact" className="hover:text-gray-300 flex xpo_items-center xpo_text-center md:text-auto xpo_p-2 md:p-0">
                                <MailIcon className="w-5 xpo_h-5 xpo_mr-3" />
                                <span className="hidden md:inline">Contact</span>
                            </Link>
                        </li>
                        <li className="py-2 flex xpo_items-center">
                            <Link to="/settings" className="hover:text-gray-300 flex xpo_items-center xpo_text-center md:text-auto xpo_p-2 md:p-0">
                                <Settings2 className="w-5 xpo_h-5 xpo_mr-3" />
                                <span className="hidden md:inline">Settings</span>
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
