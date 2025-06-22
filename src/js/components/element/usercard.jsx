import React, { useState, useRef, useEffect } from 'react';
import { createPopper } from '@popperjs/core';
import { Link } from 'react-router-dom';
import { ChevronRight, EllipsisVertical } from 'lucide-react';
import { useTranslation } from "@context/LanguageProvider";
import { home_url } from '../common/functions';

export const UserCard = ({ user, index }) => {
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

    return (
        <div className="position-relative border radius-16 overflow-hidden">
            <img
                src={`https://wowdash.wowtheme7.com/bundlelive/demo/assets/images/user-grid/user-grid-bg${index + 1}.png`}
                alt="cover photo"
                className="w-100 object-fit-cover"
            />

            <div className="dropdown position-absolute top-0 end-0 me-16 xpo_mt-16">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className="bg-white-gradient-light xpo_w-32-px xpo_h-32-px radius-8 border border-light-white flex xpo_justify-content-center xpo_items-center xpo_text-white"
                >
                    <EllipsisVertical className="icon" />
                </button>

                {menuOpened && (
                    <ul
                        ref={dropdownRef}
                        className="dropdown-menu show xpo_p-12 border bg-base shadow"
                    >
                        <li>
                            <Link
                                to={ home_url(`/users/${user.id}/edit`) }
                                className="dropdown-item px-16 py-8 rounded xpo_text-secondary-light bg-hover-neutral-200 xpo_text-hover-neutral-900 flex xpo_items-center xpo_gap-10"
                            >
                                {__('Edit')}
                            </Link>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="delete-btn dropdown-item px-16 py-8 rounded xpo_text-secondary-light bg-hover-danger-100 xpo_text-hover-danger-600 flex xpo_items-center xpo_gap-10"
                            >
                                {__('Delete')}
                            </button>
                        </li>
                    </ul>
                )}
            </div>

            <div className="ps-16 xpo_pb-16 pe-16 xpo_text-center xpo_mt--50">
                <div className="relative">
                    <img src={ user?.avater??'' } alt={__('User Avatar')} className="border br-white border-width-2-px xpo_w-100-px xpo_h-100-px rounded-circle object-fit-cover" />
                    <div className="absolute top-0 right-0 xpo_w-full xpo_h-full"></div>
                </div>
                <h6 className="text-lg xpo_mb-0 xpo_mt-4">{user.name}</h6>
                <span className="text-secondary-light xpo_mb-16">{user.email}</span>

                <div className="center-border position-relative bg-danger-gradient-light radius-8 xpo_p-12 flex xpo_items-center xpo_gap-4">
                    <div className="text-center xpo_w-50">
                        <h6 className="text-md xpo_mb-0">{user.department}</h6>
                        <span className="text-secondary-light xpo_text-sm xpo_mb-0">Department</span>
                    </div>
                    <div className="text-center xpo_w-50">
                        <h6 className="text-md xpo_mb-0">{user.designation}</h6>
                        <span className="text-secondary-light xpo_text-sm xpo_mb-0">Designation</span>
                    </div>
                </div>

                <Link
                    to={home_url(`/users/${user.id}/view`)}
                    className="bg-primary-50 xpo_text-primary-600 bg-hover-primary-600 hover-text-white xpo_p-10 xpo_text-sm btn-sm px-12 py-12 radius-8 flex xpo_items-center xpo_justify-content-center xpo_mt-16 fw-medium xpo_gap-2 xpo_w-100"
                >
                    {__('View Profile')}
                    <ChevronRight className="icon xpo_text-xl line-height-1" />
                </Link>
            </div>
        </div>
    );
};
