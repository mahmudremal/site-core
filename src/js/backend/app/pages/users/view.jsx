import React, { useEffect, useRef, useState } from "react";
import CoverPhoto from '@img/cover-photo.png';
import { useTranslation } from "@context/LanguageProvider";
import { useLoading } from "@context/LoadingProvider";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, X } from "lucide-react";
import { notify, rest_url, home_route } from "@functions";
import request from "@common/request";
import { sprintf } from "sprintf-js";

const ProfileEdit = ({ user, setUser }) => {
    const { __ } = useTranslation();
    const { setLoading } = useLoading();
    const { userid } = useParams();
    const [activeTab, setActiveTab] = useState('edit');
    const [notifConfig, setNotifConfig] = useState(null);

    const [previewImage, setPreviewImage] = useState(null);
    const imageInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
                const formData = new FormData();
                formData.append('avatar', file, file.name);
                fetch(rest_url(`/sitecore/v1/users/${userid}/avater`), {
                    method: 'POST', body: formData
                })
                .then(res => {
                    notify.success(__('Avater Uploading successed!'));
                    if (res?.avatar_url) {
                        setUser(prev => ({...prev, metadata: {...prev.metadata, avater: res.avatar_url}}));
                    }
                })
                .catch(async err => {
                    notify.error(sprintf(__('Error updating avater for #%d'), userid));
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const fetch_data = async () => {
        setLoading(true);
        request(rest_url(`/sitecore/v1/notifications/config`))
        .then(configs => {
            Object.keys(configs).forEach(key => configs[key] = configs[key] === true);
            setNotifConfig(configs);
        })
        .catch(err => console.error(`Error fetching user ${userid}:`, err))
        .finally(() => setLoading(false));
    };

    const isActiveTab = (tab) => {
        return activeTab == tab;
    }

    const handle_submit = (e) => {
        e.preventDefault();
        setLoading(true);
        request(rest_url(`/sitecore/v1/users/${userid}`), {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(user)
        })
        .then(res => {
            console.log(res)
            notify.success(__('User information updated successfully!'));
        })
        .catch(async err => {
            notify.error(sprintf(__('Error updating user #%d'), userid));
        })
        .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetch_data();
    }, [userid]);

    const update_notif_config = (key, status) => {
        setNotifConfig(prev => ({...prev, [key]: status}));
        request(rest_url(`/sitecore/v1/notifications/config`), {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({key, status})
        })
        .then(res => notify.success(__('Changes saved!')))
        .catch(err => notify.error(__('Error storing changes!')))
        // .finally(() => setLoading(false));
    };

    return (
        <div>
            <div className="row gy-4">
                <div className="col-lg-4">
                    <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base xpo_h-100">
                        <img src={ CoverPhoto } alt={__('Cover photo')} className="w-100 object-fit-cover" />
                        <div className="xpo_relative xpo_-mt-28 xpo_p-4">
                            <div className="text-center border border-top-0 border-start-0 border-end-0">
                                
                                <div className="xpo_relative xpo_grid xpo_grid-cols-[200px_1fr] xpo_items-end xpo_mb-4">
                                    <div className="avatar-upload position-relative">
                                        <div className="avatar-edit position-absolute bottom-0 end-0 me-24 xpo_mt-16 z-1 cursor-pointer">
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept=".png, .jpg, .jpeg"
                                                hidden
                                                ref={imageInputRef}
                                                onChange={handleImageChange}
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="w-32-px xpo_h-32-px xpo_flex xpo_justify-content-center xpo_items-center bg-primary-50 xpo_text-primary-600 border border-primary-600 bg-hover-primary-100 xpo_text-lg rounded-circle"
                                            >
                                                <Camera className="icon" />
                                            </label>
                                        </div>
                                        <div className="avatar-preview !xpo_w-52 !xpo_h-auto xpo_aspect-square">
                                            <div className="xpo_w-52 xpo_h-52 rounded-circle overflow-hidden bg-light xpo_flex xpo_items-center xpo_justify-content-center">
                                                {(previewImage || user.metadata?.avater) ? (
                                                    <img
                                                        alt={__('Avater')}
                                                        src={previewImage ? previewImage : user.metadata?.avater}
                                                        className=" xpo_w-52 xpo_h-52 xpo_object-fit-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm xpo_text-muted">{__('No image')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="xpo_relative xpo_text-left xpo_p-3 xpo_mt-12 xpo_flex xpo_flex-col xpo_gap-3">
                                        <h6>{[user.metadata?.first_name??'', user.metadata?.last_name??''].join(' ')}</h6>
                                        <span className="text-secondary-light">{user?.email??''}</span>
                                    </div>
                                </div>
                                
                            </div>
                            <div className="mt-24">
                                <h6 className="text-xl xpo_mb-16">{__('Personal Info')}</h6>
                                <ul>
                                    <li className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-12">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light">{__('Full Name')}</span>
                                        <span className="w-70 xpo_text-secondary-light fw-medium">: {[user.metadata?.first_name??'', user.metadata?.last_name??''].join(' ')}</span>
                                    </li>
                                    <li className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-12">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light"> {__('Email')}</span>
                                        <span className="w-70 xpo_text-secondary-light fw-medium">: {user?.email??'N/A'}</span>
                                    </li>
                                    <li className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-12">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light"> {__('Phone Number')}</span>
                                        <span className="w-70 xpo_text-secondary-light fw-medium">: {user.metadata?.phone??'N/A'}</span>
                                    </li>
                                    {/* <li className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-12">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light"> {__('Department')}</span>
                                        <span className="w-70 xpo_text-secondary-light fw-medium">: {user.metadata?.department??'N/A'}</span>
                                    </li>
                                    <li className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-12">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light"> {__('Designation')}</span>
                                        <span className="w-70 xpo_text-secondary-light fw-medium">: {user.metadata?.designation??'N/A'}</span>
                                    </li>
                                    <li className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-12">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light"> {__('Languages')}</span>
                                        <span className="w-70 xpo_text-secondary-light fw-medium">: {user.metadata?.partnership_dashboard_locale??'English'}</span>
                                    </li> */}
                                    <li className="xpo_gap-2">
                                        <span className="w-30 xpo_text-md fw-semibold xpo_text-primary-light"> {__('Bio')}: </span>
                                        <p className="w-70 xpo_text-secondary-light fw-medium">{user.metadata?.description??''}</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card xpo_h-100">
                        <div className="card-body xpo_p-24">
                            <ul className="nav border-gradient-tab nav-pills xpo_mb-20 d-inline-flex" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={ `nav-link xpo_flex xpo_items-center px-24 ${isActiveTab('edit') && 'active'}` }
                                        id="pills-edit-profile-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-edit-profile"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-edit-profile"
                                        aria-selected={isActiveTab('edit')}
                                        onClick={() => setActiveTab('edit')}
                                    >
                                        {__('Edit Profile')} 
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={ `nav-link xpo_flex xpo_items-center px-24 ${isActiveTab('password') && 'active'}` }
                                        id="pills-change-password-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-change-password"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-change-password"
                                        aria-selected={isActiveTab('password')}
                                        onClick={() => setActiveTab('password')}
                                        tabIndex="-1"
                                    >
                                        {__('Change Password')} 
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={ `nav-link xpo_flex xpo_items-center px-24 ${isActiveTab('notification') && 'active'}` }
                                        id="pills-notification-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-notification"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-notification"
                                        aria-selected={isActiveTab('notification')}
                                        onClick={() => setActiveTab('notification')}
                                        tabIndex="-1"
                                    >
                                        {__('Notification Settings')}
                                    </button>
                                </li>
                            </ul>

                            <div className="tab-content" id="pills-tabContent">   
                                <div className={ `tab-pane fade ${isActiveTab('edit') && 'show active'}` } id="pills-edit-profile" role="tabpanel" aria-labelledby="pills-edit-profile-tab" tabIndex="0">
                                    <h6 className="text-md xpo_text-primary-light xpo_mb-16">{__('Profile Image')}</h6>
                                    
                                    <form onSubmit={handle_submit}>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="fname" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('First Name')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control radius-8"
                                                        id="fname"
                                                        placeholder={__('Enter First Name')}
                                                        defaultValue={user.metadata?.first_name}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, first_name: event.target.value}}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="lname" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Last Name')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control radius-8"
                                                        id="lname"
                                                        placeholder={__('Enter Last Name')}
                                                        defaultValue={user.metadata?.last_name}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, last_name: event.target.value}}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="email" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Email')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="email"
                                                        className="form-control radius-8"
                                                        id="email"
                                                        placeholder={__('Enter email address')}
                                                        defaultValue={user?.email}
                                                        onChange={(event) => setUser(prev => ({...prev, email: event.target.value}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="number" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Phone')}</label>
                                                    <input
                                                        type="phone"
                                                        className="form-control radius-8"
                                                        id="number"
                                                        placeholder={__('Enter phone number')}
                                                        defaultValue={user.metadata?.phone??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, phone: event.target.value}}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="depart" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Department')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="depart"
                                                        defaultValue={user.metadata?.department??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, department: event.target.value}}))}
                                                    >
                                                        <option>Enter Event Title </option>
                                                        <option>Enter Event Title One </option>
                                                        <option>Enter Event Title Two</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="desig" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Designation')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="desig"
                                                        defaultValue={user.metadata?.designation??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, designation: event.target.value}}))}
                                                    >
                                                        <option>Enter Designation Title </option>
                                                        <option>Enter Designation Title One </option>
                                                        <option>Enter Designation Title Two</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="Language" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Language')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="Language"
                                                        defaultValue={user.metadata?.partnership_dashboard_locale}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, partnership_dashboard_locale: event.target.value}}))}
                                                    >
                                                        <option value="en"> English</option>
                                                        <option value="bn"> Bangla </option>
                                                        <option value="hi"> Hindi</option>
                                                        <option value="ar"> Arabic</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="mb-20">
                                                    <label htmlFor="desc" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Description')}</label>
                                                    <textarea
                                                        name="description"
                                                        className="form-control radius-8"
                                                        id="desc"
                                                        placeholder={__('Write description...')}
                                                        defaultValue={user.metadata?.description??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, description: event.target.value}}))}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="xpo_flex xpo_items-center xpo_justify-content-center xpo_gap-3">
                                            <button type="reset" className="border border-danger-600 bg-hover-danger-200 xpo_text-danger-600 xpo_text-md px-56 py-11 radius-8"> 
                                                {__('Cancel')}
                                            </button>
                                            <button type="submit" className="btn btn-primary border border-primary-600 xpo_text-md px-56 py-12 radius-8"> 
                                                {__('Save')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className={ `tab-pane fade ${isActiveTab('password') && 'show active'}` } id="pills-change-password" role="tabpanel" aria-labelledby="pills-change-password-tab" tabIndex="0">
                                    <div className="mb-20">
                                        <label htmlFor="your-password" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('New Password')} <span className="text-danger-600">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control radius-8" id="your-password" placeholder={__('Enter New Password*')} />
                                            <span className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 xpo_text-secondary-light" data-toggle="#your-password"></span>
                                        </div>
                                    </div>
                                    <div className="mb-20">
                                        <label htmlFor="confirm-password" className="form-label fw-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Confirmed Password')} <span className="text-danger-600">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control radius-8" id="confirm-password" placeholder={__('Confirm Password*')} />
                                            <span className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 xpo_text-secondary-light" data-toggle="#confirm-password"></span>
                                        </div>
                                    </div>
                                </div>

                                <div className={ `tab-pane fade ${isActiveTab('notification') && 'show active'}` } id="pills-notification" role="tabpanel" aria-labelledby="pills-notification-tab" tabIndex="0">
                                    {notifConfig ? (
                                        <div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative xpo_mb-16">
                                                <label htmlFor="companzNew" className="position-absolute xpo_w-100 xpo_h-100 start-0 top-0"></label>
                                                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium xpo_text-secondary-light">{__('Company News')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="companzNew" checked={notifConfig?.['pm_notis-news']} onChange={(e) => update_notif_config('pm_notis-news', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative xpo_mb-16">
                                                <label htmlFor="pushNotifcation" className="position-absolute xpo_w-100 xpo_h-100 start-0 top-0"></label>
                                                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium xpo_text-secondary-light">{__('Push Notification')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="pushNotifcation" checked={notifConfig?.['pm_notis-push']} onChange={(e) => update_notif_config('pm_notis-push', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative xpo_mb-16">
                                                <label htmlFor="weeklyLetters" className="position-absolute xpo_w-100 xpo_h-100 start-0 top-0"></label>
                                                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium xpo_text-secondary-light">{__('Weekly News Letters')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="weeklyLetters" checked={notifConfig?.['pm_notis-newsletter']} onChange={(e) => update_notif_config('pm_notis-newsletter', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative xpo_mb-16">
                                                <label htmlFor="meetUp" className="position-absolute xpo_w-100 xpo_h-100 start-0 top-0"></label>
                                                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium xpo_text-secondary-light">{__('Meetups Near you')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="meetUp" checked={notifConfig?.['pm_notis-meetup']} onChange= {(e) => update_notif_config('pm_notis-meetup', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative xpo_mb-16">
                                                <label htmlFor="orderNotification" className="position-absolute xpo_w-100 xpo_h-100 start-0 top-0"></label>
                                                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium xpo_text-secondary-light">{__('Orders Notifications')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="orderNotification" checked={notifConfig?.['pm_notis-order']} onChange={(e) => update_notif_config('pm_notis-order', e.target.checked)} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


const ProfileView = ({ user: userData }) => {
    const { __ } = useTranslation();
    const { setLoading } = useLoading();
    const { userid: user_id } = useParams();
    const [user, setUser] = useState({
        avatar: '',
        skills: [
            // 'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Tailwind Css'
        ],
        experiences: [
            // {
            //     role: 'Web Developer',
            //     company: 'ABC Company',
            //     duration: '2017 - 2019',
            //     description:
            //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus est vitae tortor ullamcorper, ut vestibulum velit convallis. Aenean posuere risus non velit egestas suscipit.',
            // },
            // {
            //     role: 'Web Developer',
            //     company: 'ABC Company',
            //     duration: '2017 - 2019',
            //     description:
            //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus est vitae tortor ullamcorper, ut vestibulum velit convallis. Aenean posuere risus non velit egestas suscipit.',
            // },
            // {
            //     role: 'Web Developer',
            //     company: 'ABC Company',
            //     duration: '2017 - 2019',
            //     description:
            //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus est vitae tortor ullamcorper, ut vestibulum velit convallis. Aenean posuere risus non velit egestas suscipit.',
            // },
        ],
        socials: [
            // { platform: 'facebook', url: '#' },
            // { platform: 'twitter', url: '#' },
            // { platform: 'linkedin', url: '#' },
            // { platform: 'github', url: '#' },
            // { platform: 'instagram', url: '#' }
        ],
        metadata: {},
        ...userData
    });

    useEffect(() => {
        setLoading(true);
        request(rest_url(`/sitecore/v1/users/${user_id}`))
        .then(res => setUser(prev => ({...prev, ...res})))
        .catch(err => console.error(`Error fetching user ${user_id}:`, err))
        .finally(() => setLoading(false));
    }, [user_id]);

    return (
        <div className="xpo_bg-gray-100">
            <div className="xpo_container xpo_mx-auto xpo_py-8">
                <div className="xpo_grid xpo_grid-cols-4 sm:xpo_grid-cols-12 xpo_gap-6 xpo_px-4">
                    <div className="xpo_col-span-4 sm:xpo_col-span-3">
                        <div className="xpo_bg-white xpo_shadow xpo_rounded-lg xpo_p-6">
                            <div className="xpo_flex xpo_flex-col xpo_items-center">
                                <img
                                    src={user?.avater??'#'}
                                    alt={__('User Avatar')}
                                    className="xpo_w-32 xpo_h-32 xpo_bg-gray-300 xpo_rounded-full xpo_mb-4 xpo_shrink-0"
                                />
                                <h5 className="xpo_text-xl xpo_font-bold">{[user.metadata?.first_name??'', user.metadata?.first_name??''].join(' ').trim()}</h5>
                                <p className="xpo_text-gray-700">{user?.metadata?.designation??''}</p>
                                <div className="xpo_mt-6 xpo_flex xpo_flex-wrap xpo_gap-4 xpo_justify-center">
                                    <a href="#" className="hover:xpo_bg-primary-600 xpo_bg-primary-500 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded">{__('Contact')}</a>
                                    <a href="#" className="hover:xpo_bg-gray-400 xpo_bg-gray-300 xpo_text-gray-700 xpo_py-2 xpo_px-4 xpo_rounded">{__('Resume')}</a>
                                </div>
                            </div>
                            { user.skills?.length > 0 ? <hr className="xpo_my-6 xpo_border-t xpo_border-gray-300" /> : null}
                            { user.skills?.length > 0 ? (
                                <div className="xpo_flex xpo_flex-col">
                                    <span className="xpo_text-gray-700 xpo_uppercase xpo_font-bold xpo_tracking-wider xpo_mb-2">{__('Skills')}</span>
                                    <ul>
                                        {user.skills.map((skill, index) => (
                                            <li key={index} className="xpo_mb-2">
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="xpo_col-span-4 sm:xpo_col-span-9">
                        <div className="xpo_bg-white xpo_shadow xpo_rounded-lg xpo_p-6">
                            <h6 className="xpo_text-xl xpo_font-bold xpo_mb-4">About Me</h6>
                            <p className="xpo_text-gray-700">{user?.metadata?.description??''}</p>
                            {user.socials?.length ? (
                                <>
                                <div className="xpo_font-semibold xpo_text-center xpo_mt-3 -xpo_mb-2">{__('Find me on')}</div>
                                <div className="xpo_flex xpo_justify-center xpo_items-center xpo_gap-6 xpo_my-6">
                                    {user.socials.map((row, idx) => (
                                        <a
                                            key={idx}
                                            target="_blank"
                                            rel="noreferrer"
                                            href={ row?.url??'#' }
                                            className="xpo_text-gray-700 hover:xpo_text-orange-600"
                                        >
                                            <Socials platform={row?.platform} className="xpo_w-6 xpo_h-auto" />
                                        </a>
                                    ))}
                                </div>
                                </>
                            ) : null}

                            {user.experiences?.length ? <h6 className="xpo_text-xl xpo_font-bold xpo_mt-6 xpo_mb-4">{__('Experience')}</h6> : null}
                            
                            {user.experiences.map((exp, index) => (
                                <div key={index} className="xpo_mb-6">
                                    <div className="xpo_flex xpo_justify-between xpo_flex-wrap xpo_gap-2 xpo_w-full">
                                        <span className="xpo_text-gray-700 xpo_font-bold">{exp.role}</span>
                                        <p>
                                            <span className="xpo_text-gray-700 xpo_mr-2">at {exp.company}</span>
                                            <span className="xpo_text-gray-700">{exp.duration}</span>
                                        </p>
                                    </div>
                                    <p className="xpo_mt-2">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const UserProfile = () => {
    const { __ } = useTranslation();
    const navigate = useNavigate();
    const { loading, setLoading } = useLoading();
    const { userid: user_id } = useParams();
    // const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        setLoading(true);
        request(rest_url(`/sitecore/v1/users/${user_id}`))
        .then(res => setUserData(prev => res))
        .catch(err => setError(err?.response?.message??err?.message??__('We could not fetch user profile')))
        .finally(() => setLoading(false));
    }, [user_id]);

    return (
        <div>
            {userData ? (
                <div>
                    {userData?.editable ? (
                        <ProfileEdit user={userData} setUser={setUserData} />
                    ) : (
                        <ProfileView user={userData} setUser={setUserData} />
                    )}
                </div>
            ) : error ? (
                <div>
                    <div class="alert alert-danger bg-danger-100 xpo_text-danger-600 border-danger-100 px-24 py-11 xpo_mb-0 fw-semibold xpo_text-lg radius-8" role="alert">
                        <div class="xpo_flex xpo_items-center xpo_justify-content-between xpo_text-lg">
                            {error} 
                            {/* window.history.back() */}
                            <button class="remove-button xpo_text-danger-600 xpo_text-xxl line-height-1" onClick={() => navigate(home_route('/'))}>
                                <X className="icon" />
                            </button>
                        </div>
                        <p class="fw-medium xpo_text-danger-600 xpo_text-sm xpo_mt-8">{__('If you didn\'t get this error that means either this profile removed, paused or archive forever. Please contact with support if you want to get access to this person personally.')}</p>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

const Socials = ({ platform, ...params }) => {
    if (platform === 'facebook') {
        return <svg {...params} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>;
    }
    if (platform === 'twitter') {
        return <svg {...params} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
    }
    if (platform === 'linkedin') {
        return <svg {...params} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 1.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5M3.75 4a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0m-1.5 4A.75.75 0 0 1 3 7.25h4a.75.75 0 0 1 .75.75v13a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75zm1.5.75v11.5h2.5V8.75zM9.25 8a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.434l.435-.187a7.8 7.8 0 0 1 2.358-.595C20.318 7.4 22.75 9.58 22.75 12.38V21a.75.75 0 0 1-.75.75h-4a.75.75 0 0 1-.75-.75v-7a1.25 1.25 0 0 0-2.5 0v7a.75.75 0 0 1-.75.75h-4a.75.75 0 0 1-.75-.75zm1.5.75v11.5h2.5V14a2.75 2.75 0 1 1 5.5 0v6.25h2.5v-7.87c0-1.904-1.661-3.408-3.57-3.234a6.3 6.3 0 0 0-1.904.48l-1.48.635a.75.75 0 0 1-1.046-.69V8.75z" fill="#000"/></svg>;
    }
    if (platform === 'github') {
        return <svg {...params} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
    }
    if (platform === 'instagram') {
        return <svg {...params} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>;
    }
    return null;
}


export default UserProfile;