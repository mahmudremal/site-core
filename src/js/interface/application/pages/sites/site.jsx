import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { ArrowUp, Award, ChevronDown, ChevronUp, MoveUp, Receipt, Users, UsersRound, Wallet } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { home_url } from '@functions';
import request from '@common/request';
import { get_site, store_rest } from '.';

export default function Site() {
    const { __ } = useTranslation();
    const { site_id } = useParams();
    const [site, setSite] = useState(null);
    const [error, setError] = useState(null);
    const [inSights, setInSights] = useState(null);

    useEffect(() => {
        if (site) {return;}
        get_site(site_id)
        .then(reSite => {
            setSite(reSite);
            request(store_rest(reSite, `/sitecore/v1/site/insights`), {headers: {'Content-Type': 'application/json'}})
            .then(res => setInSights(res))
            .catch(err => request.error_notify(err, __));
        })
        .catch(e => request.error_notify(e));
    }, [site]);

    const task_key_2name = (key) => {
        const taskNames = {
            elem_form: __('Elementor form')
        };
        return taskNames[key] || key;
    }
    
    return (
        <>
            {/* Overview cards */}
            <div className="xpo_flex xpo_flex-col xpo_gap-5">
                <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
                    {inSights && inSights?.users?.total_users ? (
                        <div className="col">
                            <div className="card shadow-none border bg-gradient-start-1 xpo_h-100">
                                <Link to={ home_url(`sites/${site_id}/users`) } className="card-body xpo_p-20">
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3">
                                        <div>
                                            <p className="fw-medium xpo_text-primary-light xpo_mb-1">{__('Total Users')}</p>
                                            <h6 className="mb-0">{(inSights.users.total_users).toFixed(0)}</h6>
                                        </div>
                                        <div className="w-50-px xpo_h-50-px bg-cyan rounded-circle flex xpo_justify-content-center xpo_items-center">
                                            <Users className="text-white xpo_text-2xl xpo_mb-0" />
                                        </div>
                                    </div>
                                    <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 flex xpo_items-center xpo_gap-2">
                                        <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main">
                                            <ChevronUp className="text-xs" />
                                            +5000
                                        </span> 
                                        Last 30 days users
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ) : null}
                    {inSights && inSights?.form_entries ? (
                        <div className="col">
                            <div className="card shadow-none border bg-gradient-start-2 xpo_h-100">
                                <Link to={ home_url(`sites/${site_id}/entries`) } className="card-body xpo_p-20">
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3">
                                        <div>
                                            <p className="fw-medium xpo_text-primary-light xpo_mb-1">{__('Total Entries')}</p>
                                            <h6 className="mb-0">{inSights.form_entries.toFixed(0)}</h6>
                                        </div>
                                        <div className="w-50-px xpo_h-50-px bg-purple rounded-circle flex xpo_justify-content-center xpo_items-center">
                                            <Award className="text-white xpo_text-2xl xpo_mb-0" />
                                        </div>
                                    </div>
                                    <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 flex xpo_items-center xpo_gap-2">
                                        <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-danger-main">
                                            <ChevronDown className="text-xs" />
                                            -800
                                        </span> 
                                        Last 30 days subscription
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ) : null}
                    {inSights && inSights?.post_types ? (
                        <div className="col">
                            <div className="card shadow-none border bg-gradient-start-3 xpo_h-100">
                                <Link to={ home_url(`sites/${site_id}/posttypes`) } className="card-body xpo_p-20">
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3">
                                        <div>
                                            <p className="fw-medium xpo_text-primary-light xpo_mb-1">{__('Total Posts')}</p>
                                            <h6 className="mb-0">{inSights.post_types.map(p => Object.values(p.counts).map(i => parseInt(i)).reduce((p, c) => p + c, 0)).reduce((p, c) => p + c, 0)}</h6>
                                        </div>
                                        <div className="w-50-px xpo_h-50-px bg-info rounded-circle flex xpo_justify-content-center xpo_items-center">
                                            <UsersRound className="text-white xpo_text-2xl xpo_mb-0" />
                                        </div>
                                    </div>
                                    <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 flex xpo_items-center xpo_gap-2">
                                        <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main">
                                            <ArrowUp className="text-xs" />
                                            +200
                                        </span> 
                                        Last 30 days users
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ) : null}
                    {inSights && inSights?.total_revenue ? (
                        <div className="col">
                            <div className="card shadow-none border bg-gradient-start-4 xpo_h-100">
                                <Link to={ home_url(`sites/${site_id}/income`) } className="card-body xpo_p-20">
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3">
                                        <div>
                                            <p className="fw-medium xpo_text-primary-light xpo_mb-1">{__('Total Income')}</p>
                                            <h6 className="mb-0">{inSights.total_revenue.toFixed(0)}</h6>
                                        </div>
                                        <div className="w-50-px xpo_h-50-px bg-success-main rounded-circle flex xpo_justify-content-center xpo_items-center">
                                            <Wallet className="text-white xpo_text-2xl xpo_mb-0" />
                                        </div>
                                    </div>
                                    <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 flex xpo_items-center xpo_gap-2">
                                        <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main">
                                            <ArrowUp className="text-xs" />
                                            +$20,000
                                        </span>
                                        Last 30 days income
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ) : null}
                    {inSights && inSights?.pending_orders ? (
                        <div className="col">
                            <div className="card shadow-none border bg-gradient-start-5 xpo_h-100">
                                <Link to={ home_url(`sites/${site_id}/orders`) } className="card-body xpo_p-20">
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3">
                                        <div>
                                            <p className="fw-medium xpo_text-primary-light xpo_mb-1">{__('Pending Orders')}</p>
                                            <h6 className="mb-0">{inSights.pending_orders}</h6>
                                        </div>
                                        <div className="w-50-px xpo_h-50-px bg-red rounded-circle flex xpo_justify-content-center xpo_items-center">
                                            <Receipt className="text-white xpo_text-2xl xpo_mb-0" />
                                        </div>
                                    </div>
                                    <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 flex xpo_items-center xpo_gap-2">
                                        <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main">
                                            <MoveUp className="text-xs" />
                                            +$5,000
                                        </span>
                                        Last 30 days expense
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ) : null}
                    {/*  */}
                    {inSights && inSights?.tasks?.total ? (
                        Object.keys(inSights.tasks)
                        .filter(i => !['total'].includes(i))
                        .filter(k => parseInt(inSights.tasks[k]))
                        .map((k, i) => 
                            <div key={i} className="col">
                                <div className="card shadow-none border bg-gradient-start-5 xpo_h-100">
                                    <Link to={ home_url(`sites/${site_id}/jobs/${['pending', 'completed'].includes(k) ? `status` : `types`}/${k}`) } className="card-body xpo_p-20">
                                        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-3">
                                            <div>
                                                <p className="fw-medium xpo_text-primary-light xpo_mb-1 capitalize">{task_key_2name(k).replaceAll('_', ' ')}</p>
                                                <h6 className="mb-0">{inSights.tasks[k] || 0}</h6>
                                            </div>
                                            <div className="w-50-px xpo_h-50-px bg-red rounded-circle flex xpo_justify-content-center xpo_items-center">
                                                <Receipt className="text-white xpo_text-2xl xpo_mb-0" />
                                            </div>
                                        </div>
                                        <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 flex xpo_items-center xpo_gap-2">
                                            <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main">
                                                <MoveUp className="text-xs" />
                                                +$5,000
                                            </span>
                                            Last 30 days expense
                                        </p>
                                    </Link>
                                </div>
                            </div>
                        )
                    ) : null}
                    {/*  */}
                </div>

            </div>

        </>
    )
}
