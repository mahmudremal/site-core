
import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import { usePopup } from '@context/PopupProvider';
// import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import request from '@common/request';
import { home_url, rest_url, notify, sleep, strtotime } from '@functions';
import { ChevronsLeft, ChevronsRight, Eye, Loader, Save, SquarePen, Store, Trash2 } from "lucide-react";

export default function Stores() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    // const { setLoading } = useLoading();
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [filters, setFilters] = useState({
        store_type: 'all',
        orderby: 'date',
        status: 'any',
        order: 'desc',
        per_page: 20,
        page: 1,
        s: ''
    });
    const [stores, setStores] = useState([]);

    const storeVariants = [
        {key: 'dev', label: __('Development'), color: 'primary'},
        {key: 'live', label: __('Production'), color: 'success'}
    ];

    const fetchStores = async () => {
        setLoading(true);
        const queryString = Object.entries(filters).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
        request(rest_url(`/sitecore/v1/stores?${queryString}`), {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            setStores(res?.list??[]);
            setTotalPages(res.totalPages || 1);
            setTotalEntries(res.total || 0);
        })
        .catch(err => console.error("Error fetching invoices:", err))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchStores();
        }, 1000); // 1000ms = 1 second delay

        return () => clearTimeout(delayDebounce);
    }, [filters]);

    const handle_delete = (e, store) => {
        e.preventDefault();
        e.target.disabled = true;
        if (store) {
            setLoading(true);
            request(rest_url(`/sitecore/v1/store/${store.id}`), {method: 'DELETE'})
            .then(res => notify.success(res?.message??__('Store removed successfully!')))
            .then(res => setPopup(null)).then(() => setStores(prev => prev.filter(s => s.id !== store.id)))
            .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
            .finally(() => setLoading(false));
        }
    }

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header">
                <div className="xpo_flex xpo_items-center xpo_justify-between">
                    <h5 className="card-title xpo_mb-0">{__('Stores')}</h5>
                    <div className="card-header-action">
                        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-4 xpo_w-full">
                            <div className="btn-group radius-8" role="group" aria-label="Default button group">
                                {[
                                    ['all', __('All')],
                                    ['development', __('Development')],
                                    ['managed', __('Managed')],
                                    ['archived', __('Archived')],
                                    ['inactive', __('Inactive')]
                                ].map(([key, label], index) => (
                                    <button key={index} type="button" className={ `btn btn-link xpo_text-secondary-light xpo_text-decoration-none xpo_p-2 hover:bg-transparent ${filters.store_type == key && 'text-primary'}` } onClick={() => setFilters(prev => ({...prev, store_type: key}))}>{label}</button>
                                ))}
                            </div>
                            <div className="xpo_flex xpo_items-center">
                                <div className="form-group xpo_mb-0 me-3">
                                    <input type="text" className="form-control" placeholder={__('Search...')} value={filters.search} onChange={(e) => setFilters({ ...filters, s: e.target.value })} />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        setPopup(
                                            <EditStore
                                                data={{}}
                                                __={__}
                                                setPopup={setPopup}
                                                variants={storeVariants}
                                                onSuccess={(data => setStores(prev => ([data, ...prev])))}
                                            />
                                        )
                                    }
                                >{__('Create new store')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table basic-border-table xpo_mb-0">
                        <thead>
                            <tr>
                                <th>{__('Store')} </th>
                                <th>{__('Active plan')}</th>
                                <th>{__('Access type')}</th>
                                <th className="text-center">{__('Details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                               <tr>
                                    <td colSpan={4} className="px-4 py-6 xpo_text-center">
                                        <p className="fw-medium">{__('Loading...')}</p>
                                    </td>
                                </tr>
                            ) : (
                                stores.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6">
                                            <div className="alert alert-warning bg-warning-100 xpo_text-warning-600 border-warning-100 px-24 py-11 xpo_mb-0 fw-semibold xpo_text-lg radius-8" role="alert">
                                                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-lg">
                                                    {__('No stores found!')} 
                                                </div>
                                                <p className="fw-medium xpo_text-warning-600 xpo_text-sm xpo_mt-8">{__('Create a new store to make purchase, to start a project or to do a thing here. Store is required to create before start with us.')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : stores.map((store, index) => (
                                    <tr key={index}>
                                        <td>{store.store_title}</td>
                                        <td>{(store?.plans??[]).map(p => <span className="badge xpo_text-sm fw-semibold rounded-pill xpo_text-success-600 bg-success-100 px-20 py-9 radius-4 xpo_text-white">{p}</span>)}</td>
                                        <td>{storeVariants.find(i => i.key === store.store_type)?.label}</td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <Link
                                                    to={ home_url(`/sites/${store?.id}/`) }
                                                    dataOnClick={(e) => {
                                                        e.preventDefault();
                                                        setPopup(
                                                            <div className="xpo_flex xpo_flex-col xpo_gap-4">
                                                                <div className="xpo_flex xpo_items-center xpo_gap-2">
                                                                    <Store className="text-xxl" /> 
                                                                    <h6 className="text-lg xpo_mb-0">{store.store_title}</h6>
                                                                </div>
                                                                <div className="block xpo_mt-2">
                                                                    <p>
                                                                        <strong>{__('Store type: ')}</strong><span>{storeVariants.find(i => i.key === store.store_type)?.label}</span><br />
                                                                        <strong>{__('Store URL: ')}</strong><span>{store.store_url}</span><br />
                                                                        <strong>{__('Store Email: ')}</strong><span>{store.store_email}</span><br />
                                                                        <strong>{__('Store Issued on: ')}</strong><span>{strtotime(store.created_at).format('DD MMM, YYYY')}</span><br />
                                                                        <strong>{__('Store Last updated: ')}</strong><span>{strtotime(store.updated_at).format('DD MMM, YYYY')}</span><br />
                                                                        {store?.plans?.length && (
                                                                            <div>
                                                                                <strong>{__('Active Plans:')}</strong><br />
                                                                                <div className="w-full flex xpo_gap-2">
                                                                                    {(store?.plans??[]).map(p => <span className="badge xpo_text-sm fw-semibold rounded-pill xpo_text-success-600 bg-success-100 px-20 py-9 radius-4 xpo_text-white">{p}</span>)}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }}
                                                    className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                ><Eye className="icon xpo_text-xl" /></Link>
                                                <button
                                                    // to={ home_url(`/stores/${store.id}/view`) }
                                                    className="bg-success-focus xpo_text-success-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(
                                                        <EditStore
                                                            data={store}
                                                            __={__}
                                                            setPopup={setPopup}
                                                            variants={storeVariants}
                                                            onSuccess={(data => setStores(prev => {
                                                                if (data?.id && prev.find(r => r.id === data.id)) {
                                                                    prev = prev.map(r => r.id === data.id ? data : r);
                                                                } else {
                                                                    prev = [data, ...prev];
                                                                }
                                                                return prev;
                                                            }))}
                                                        />
                                                    )}
                                                ><SquarePen className="icon" /></button>
                                                {false && 
                                                    <button
                                                        className="bg-danger-focus xpo_text-danger-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                        onClick={() => setPopup(
                                                            <div className="relative xpo_max-w-sm flex xpo_flex-col xpo_gap-5">
                                                                <h6 class="text-primary-500 xpo_text-lg fw-semibold">{__('Are you sure you want to delete this store?')}</h6>
                                                                <div className="xpo_flex xpo_flex-nowrap xpo_gap-5xpo_items-center xpo_justify-end">
                                                                    <button className="btn btn-light-100 xpo_text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                                                    <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => handle_delete(e, store)}>{__('Yes, I\'m sure')}</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    ><Trash2 className="icon" /></button>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card-footer">
                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_flex-wrap xpo_gap-2 xpo_mt-24">
                    <span>{sprintf(
                        __('Showing %d to %d of %d entries'),
                        (filters.page - 1) * filters.per_page + 1,
                        Math.min(filters.page * filters.per_page, totalEntries),
                        totalEntries
                    )}</span>
                    <ul className="pagination flex xpo_flex-wrap xpo_items-center xpo_gap-2 xpo_justify-content-center">
                        <li className="page-item">
                            <button onClick={() => setFilters(prev => ({...prev, page: filters.page - 1}))} className="page-link bg-neutral-200"> <ChevronsLeft /> </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className="page-item">
                                <button
                                    onClick={() => setFilters(prev => ({...prev, page: i + 1}))}
                                    className={`page-link ${filters.page === i + 1 ? 'bg-primary-600 xpo_text-white' : 'bg-neutral-200'}`}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className="page-item">
                            <button onClick={() => setFilters(prev => ({...prev, page: filters.page + 1}))} className="page-link bg-neutral-200"> <ChevronsRight /> </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}



const EditStore = ({ data = {}, variants = [], __, setPopup, onSuccess }) => {
    const [loading, setLoading] = useState(null);
    const [form, setForm] = useState({
        id: null,
        store_title: '',
        store_url: 'https://',
        store_type: 'dev',
        store_email: '',
        metadata: [],
        ...data
    });

    const handle_submit = async (event) => {
        event.preventDefault();
        // const fdata = new FormData(event.target);
        setLoading(true);
        await sleep(2000);
        request(rest_url(`/sitecore/v1/store/create`), {
            method: 'POST',
            body: JSON.stringify({...form}),
            headers: {'Content-Type': 'application/json'}
        })
        .then(async res => {
            setForm(res);
            notify.success(__('Successfully created the store'));
            sleep(2000).then(() => setPopup(null)).then(() => onSuccess(res));
        })
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoading(false));
    }
    
    return (
        <div className="max-w-md">
            <form method="post" autoComplete="off" encType="multipart/form-data" onSubmit={(e) => handle_submit(e)}>
                <div className="row gy-3">
                    <h5>{__('Create new Store')}</h5>
                    <div className="col-12">
                        <label className="form-label">{__('Store name')}</label>
                        <input type="text" className="form-control" required value={form.store_title} onChange={(e) => setForm(prev => ({...prev, store_title: e.target.value}))} />
                    </div>
                    <div className="col-12 was-validated">
                        <label className="form-label">{__('Store url')}</label>
                        <input type="url" className="form-control" required placeholder="https://..." value={form.store_url} onChange={(e) => setForm(prev => ({...prev, store_url: e.target.value}))} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">{__('Store type')}</label>
                        <div className="xpo_flex xpo_flex-wrap xpo_w-full xpo_gap-4">
                            {variants.map(({key: tKey, label: tLabel, color}, i) => (
                                <div key={i} className={ `bg-${color}-50 px-20 py-12 radius-8` }>
                                    <span className={ `form-check checked-${color} flex xpo_items-center xpo_gap-2` }>
                                        <input className="form-check-input" type="radio" name="store_type" id={ `store_type_${tKey}` } checked={tKey ==form.store_type} value={tKey} onChange={(e) => setForm(prev => ({...prev, store_type: e.target.value}))} />
                                        <label className="form-check-label line-height-1 fw-medium xpo_text-secondary-light" htmlFor={ `store_type_${tKey}` }> {tLabel}</label>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* was-validated */}
                    <div className="col-12">
                        <label className="form-label">{__('Store email')}</label>
                        <input type="email" className="form-control" required value={form.store_email} onChange={(e) => setForm(prev => ({...prev, store_email: e.target.value}))} />
                    </div>
                    <button type="submit" className={ `btn rounded-pill radius-8 px-20 py-11 flex xpo_items-center xpo_gap-3 xpo_justify-center ${loading ? 'btn-secondary-light xpo_text-secondary-light' : 'btn-success-100 xpo_text-success-600'}` } disabled={loading}>
                        {loading ? <Loader className="animate-spin" /> : <Save />}
                        <span>{__('Submit')}</span>
                    </button>
                </div>
            </form>
        </div>
    )
};