
import React, { useEffect, useState } from "react";
import { home_url, rest_url, notify, strtotime } from "@functions";
import request from "@common/request";
import { Link } from '@common/link';
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';

export default function Contracts({ filters = 'any' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState([]);

    const fetchContracts = () => {
        // Simulate an API call to fetch contracts
        request(rest_url(`/sitecore/v1/contracts`))
        .then(list => setContracts(list))
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchContracts();
    }, []);

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header">
                <h5 className="card-title xpo_mb-0">{filters == 'inactive' ? __('Inactive contracts') : (
                    filters == 'active' ? __('Active contracts') : __('All contracts')
                )}</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table basic-border-table xpo_mb-0">
                        <thead>
                            <tr>
                                <th>{__('Invoice')}</th>
                                <th>{__('Aggrement')}</th>
                                <th>{__('Issued Date')}</th>
                                <th>{__('Amount')}</th>
                                <th>{__('Action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        <div className="spinner-border xpo_text-primary" role="status">
                                            <span className="visually-hidden">{__('Loading...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                contracts?.length > 0 ? (
                                    contracts.map((contract, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Link to={contract?.invoice_item?.invoice_id ? home_url(`invoices/${contract?.invoice_item?.invoice_id}/view`) : '#'}>
                                                    #{contract?.invoice_item?.invoice_id??contract.id}
                                                </Link>
                                            </td>
                                            <td>{contract?.title == '' ? __('Untitled contract') : contract.title}</td>
                                            <td>{strtotime(contract.created_at).format('DD MMM, YYYY')}</td>
                                            <td>{contract?.invoice_item?.total}</td>
                                            <td>
                                                <Link to={ home_url(`/contracts/${contract.id}/board`) } className="text-primary-600">{__('View More >')}</Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            {__('No contracts found')}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

