import { useState, useRef, useEffect } from 'react';
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

            <div className="dropdown position-absolute top-0 end-0 me-16 mt-16">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className="bg-white-gradient-light w-32-px h-32-px radius-8 border border-light-white flex justify-content-center items-center text-white"
                >
                    <EllipsisVertical className="icon" />
                </button>

                {menuOpened && (
                    <ul
                        ref={dropdownRef}
                        className="dropdown-menu show p-12 border bg-base shadow"
                    >
                        <li>
                            <Link
                                to={home_url(`/users/${user.id}/edit`)}
                                className="dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 flex items-center gap-10"
                            >
                                {__('Edit')}
                            </Link>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="delete-btn dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-danger-100 text-hover-danger-600 flex items-center gap-10"
                            >
                                {__('Delete')}
                            </button>
                        </li>
                    </ul>
                )}
            </div>

            <div className="ps-16 pb-16 pe-16 text-center mt--50">
                <div className="relative">
                    <img src={user?.avater ?? ''} alt={__('User Avatar')} className="border br-white border-width-2-px w-100-px h-100-px rounded-circle object-fit-cover" />
                    <div className="absolute top-0 right-0 w-full h-full"></div>
                </div>
                <h6 className="text-lg mb-0 mt-4">{user.name}</h6>
                <span className="text-secondary-light mb-16">{user.email}</span>

                <div className="center-border position-relative bg-danger-gradient-light radius-8 p-12 flex items-center gap-4">
                    <div className="text-center w-50">
                        <h6 className="text-md mb-0">{user.department}</h6>
                        <span className="text-secondary-light text-sm mb-0">Department</span>
                    </div>
                    <div className="text-center w-50">
                        <h6 className="text-md mb-0">{user.designation}</h6>
                        <span className="text-secondary-light text-sm mb-0">Designation</span>
                    </div>
                </div>

                <Link
                    to={home_url(`/users/${user.id}/view`)}
                    className="bg-primary-50 text-primary-600 bg-hover-primary-600 hover-text-white p-10 text-sm btn-sm px-12 py-12 radius-8 flex items-center justify-content-center mt-16 fw-medium gap-2 w-100"
                >
                    {__('View Profile')}
                    <ChevronRight className="icon text-xl line-height-1" />
                </Link>
            </div>
        </div>
    );
};
