import React, { useState, useEffect } from 'react';
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { useParams } from 'react-router-dom';
import request from '@common/request';
import { home_url, strtotime } from '@functions';
import { Eye, PenBoxIcon } from "lucide-react";
import { get_site, store_rest } from '.';

export default function Post() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { site_id, post_type, post_id } = useParams();
    const { loading, setLoading } = useLoading();
    const [post, setPost] = useState([]);
    const [site, setSite] = useState(null);
    const [editMode, setEditMode] = useState(null);

    useEffect(() => {
        if (site) {return;}
        get_site(site_id)
        .then(s => {
            setSite(s);
            setLoading(true);
            request(store_rest(s, `/sitecore/v1/posts/${post_type}/${post_id}`), {headers: {'Content-Type': 'application/json'}})
            .then(res => setPost(res))
            .catch(err => request.error_notify(err, __))
            .finally(() => setLoading(false));
        })
        .catch(err => request.error_notify(err, __));
    }, [site]);

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header">
                <div className="xpo_flex xpo_items-center xpo_justify-between">
                    <h5 className="card-title xpo_mb-0">{post.post_title}</h5>
                    <div className="card-header-action">
                        <button
                            type="button"
                            onClick={(e) => setEditMode(prev => !prev)}
                        >
                            {editMode ? <Eye /> : <PenBoxIcon />}
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body">
                {!editMode ? <div dangerouslySetInnerHTML={{__html: post.post_content}}></div> : (
                    <div className="alert alert-danger bg-danger-100 xpo_text-danger-600 bpost-danger-100 px-24 py-11 xpo_mb-0 fw-semibold xpo_text-lg radius-8">
                        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-lg">Edit mode is under development</div>
                        <p class="fw-medium xpo_text-danger-600 xpo_text-sm xpo_mt-8">Edit mode development is hald due to the limitation of implemneting gutenburg and elementor pagebuilder template limitation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}