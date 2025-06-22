import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { notify, request_headers, rest_url, strtotime } from '@functions';
import { X } from 'lucide-react';
import Pagination from './pagination';

export default function Issues({ setLoading }) {
    const [issues, setIssues] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            try {
                const response = await axios.post(rest_url('/proadmin/v1/issues/list'), { page: currentPage }, request_headers());
                const { list, pagination } = response.data;
                setIssues(list);
                setTotalPages(pagination.totalPage);
            } catch (error) {
                notify.error(error?.message ?? 'Failed to fetch issues list.');
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleIssueClick = (issue) => {
        setSelectedIssue(issue);
    };

    const closePopup = () => {
        setSelectedIssue(null);
    };

    return (
        <div className="xpo_w-full xpo_p-6 xpo_rounded-lg">
            <h1 className="xpo_text-2xl xpo_font-semibold xpo_mb-6">Issues List</h1>
            <table className="xpo_w-full xpo_table-auto xpo_border-collapse xpo_mb-6">
                <thead>
                    <tr className="xpo_bg-gray-100">
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">#id</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Platform</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Subject</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Created At</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">User ID</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">View</th>
                    </tr>
                </thead>
                <tbody>
                    {issues.map(issue => (
                        <tr key={issue.id} className="xpo_cursor-pointer hover:xpo_bg-gray-100">
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{issue.id}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{issue.error_platform}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{issue.error_subject}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{strtotime(issue.created_at).format('DD MMM, YYYY')}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{issue.user_id}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">
                                <button 
                                    className="xpo_px-4 xpo_py-2 xpo_bg-primary-500 xpo_text-white xpo_rounded hover:xpo_bg-primary-700"
                                    onClick={() => handleIssueClick(issue)}
                                >{__('Details')}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination */}
            <Pagination totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
            {/* End Pagination */}
            {selectedIssue && 
                <div className="xpo_fixed xpo_inset-0 xpo_bg-gray-800 xpo_bg-opacity-50 xpo_flex xpo_justify-center xpo_items-center">
                    <div className="xpo_w-full md:xpo_max-w-3xl xpo_bg-white xpo_rounded-lg xpo_p-6 xpo_relative xpo_max-h-screen md:xpo_max-h-[90vh] xpo_overflow-y-auto">
                        <button 
                            className="xpo_absolute xpo_top-2 xpo_right-2 xpo_text-gray-500 hover:xpo_text-gray-700"
                            onClick={closePopup}
                        >
                            <X size={16} />
                        </button>
                        <IssueDetail issue={selectedIssue} />
                    </div>
                </div>
            }
        </div>
    );
}

const IssueDetail = ({ issue }) => {
    return (
        <div>
            <h2 className="xpo_text-2xl xpo_font-semibold xpo_mb-4">Issue Details</h2>
            <p><strong>ID:</strong> {issue.id}</p>
            <p><strong>Platform:</strong> {issue.error_platform}</p>
            <p><strong>Subject:</strong> {issue.error_subject}</p>
            <p><strong>Created At:</strong> {strtotime(issue.created_at).format('DD MMM, YYYY')}</p>
            <p><strong>User ID:</strong> {issue.user_id}</p>
            <p><strong>Error Message:</strong></p>
            <pre className="xpo_whitespace-pre-wrap xpo_bg-gray-100 xpo_p-4 xpo_rounded-lg xpo_mt-2">{issue.error_message}</pre>
        </div>
    );
}
