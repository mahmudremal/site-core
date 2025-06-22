import React, { useState, useEffect } from 'react';
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { useParams } from 'react-router-dom';
import request from '@common/request';
import { home_url, rest_url, notify } from '@functions';
import { Eye } from "lucide-react";
import { get_site, store_rest } from '.';

export default function PostTypes() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { site_id } = useParams();
    const { loading, setLoading } = useLoading();
    const [postTypes, setPostTypes] = useState([]);
    const [site, setSite] = useState(null);

    useEffect(() => {
        if (site) {return;}
        get_site(site_id)
        .then(s => {
            setSite(s);
            setLoading(true);
            request(store_rest(s, `/sitecore/v1/posts/types`), {headers: {'Content-Type': 'application/json'}})
            .then(res => setPostTypes(res?.list??res))
            .catch(err => request.error_notify(err, __))
            .finally(() => setLoading(false));
        })
        .catch(err => request.error_notify(err, __))
        .finally(() => fetch_postTypes());
    }, [site]);

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header">
                <div className="xpo_flex xpo_items-center xpo_justify-between">
                    <h5 className="card-title xpo_mb-0">{__('Contents')}</h5>
                    <div className="card-header-action"></div>
                </div>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table basic-border-table xpo_mb-0">
                        <thead>
                            <tr>
                                <th>{__('Post type')}</th>
                                <th>{__('Detail')}</th>
                                <th className="text-center">{__('See list')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                               <tr>
                                    <td colSpan={3} className="px-4 py-6 xpo_text-center">
                                        <p className="fw-medium">{__('Loading...')}</p>
                                    </td>
                                </tr>
                            ) : (
                                postTypes.length == 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6">
                                            <div className="alert alert-warning bg-warning-100 xpo_text-warning-600 bpost-warning-100 px-24 py-11 xpo_mb-0 fw-semibold xpo_text-lg radius-8" role="alert">
                                                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-lg">
                                                    {__('No post types found!')} 
                                                </div>
                                                <p className="fw-medium xpo_text-warning-600 xpo_text-sm xpo_mt-8">{__('Create a new post type regarding that site. Maybe using ACF plugin will help you to do that.')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : postTypes.map((type, index) => (
                                    <tr key={index}>
                                        <td>{type.label}</td>
                                        <td>{type.description}</td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <Link to={ home_url(`/sites/${site_id}/posttypes/${type.name}`) } className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center">
                                                    <Eye className="icon xpo_text-xl" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}