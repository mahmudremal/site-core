
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { home_url, rest_url, notify, roles } from '@functions';
import request from '@common/request';
import { Download, TicketPlus } from 'lucide-react';
import faqImg from '@img/faq-img.png';
import emptyStreet from '@icons/empty-street.svg';

export default function Supports() {
    const { __ } = useTranslation();
    const post_type = 'support', post_taxonomy = 'support_category', app_slug = 'supports';
    const pageData = {title: __('Supports for you!'), description: __('We\'re always being waiting for your message. Please feel free to contact us.')};
    const [pageTitle, setPageTitle] = useState(pageData?.title??__('Partnership documentations.'));
    const [pageDescription, setPageDescription] = useState(pageData?.description??__('Here we explained all necessery documentation and frequently asked questions regarding your partner program. Please find below or search them or if you didn\'t found any, please let us know.'));
    const [tickets, setTickets] = useState([]);
    const [active, setActive] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        request(rest_url(`sitecore/v1/supports/tickets`))
        .then(res => {setTickets(res.list);setActive(res.list?.[0]?.id);})
        .catch(e => notify.error(e?.response?.message??e?.message??__('Error fetching partner docs.')))
        .finally(() => setLoading(false));
    }, [post_type]);

    const forceHTTPS = (url) => {
        try {
            const parsedUrl = new URL(url);
            parsedUrl.protocol = 'https:';
            return parsedUrl.href;
        } catch (e) {
            console.error('Invalid URL:', url);
            return null;
        }
    }
    const shortenMiddle = (text, startLength = 8, endLength = 8) => {
        if (text.length <= startLength + endLength + 3) {
            return text; // No need to shorten
        }
        const start = text.slice(0, startLength);
        const end = text.slice(-endLength);
        return `${start}...${end}`;
    }


    
    return (
        <div className="card basic-data-table">
            <div className="card-header xpo_p-0 border-0">
                <div className="responsive-padding-40-150 xpo_bg-primary-100">
                    <div className="row gy-4 xpo_items-center">
                        <div className="col-xl-7">
                            <h4 className="mb-20">{pageTitle}</h4>        
                            <p className="mb-0 xpo_text-secondary-light xpo_max-w-634-px xpo_text-xl">{pageDescription}</p>
                            <div className="xpo_my-4 xpo_flex xpo_flex-wrap xpo_gap-3">
                                <Link to={home_url('/support/open-ticket')} className="btn btn-primary xpo_mt-4">
                                    {__('Open New Ticket')}
                                </Link>
                                {roles.has_ability('partner-docs') ? 
                                    <Link to={home_url('/resources/partner-docs')} className="btn btn-outline-primary xpo_mt-4 ms-2">
                                        {__('Documentation')}
                                    </Link>
                                : null}
                                {roles.has_ability('service-docs') ? 
                                    <Link to={home_url('/resources/service-docs')} className="btn btn-outline-primary xpo_mt-4 ms-2">
                                        {__('FAQ')}
                                    </Link>
                                : null}
                            </div>
                        </div>
                        <div className="col-xl-5 d-xl-block d-none xpo_relative">
                            <img src={faqImg} alt={__('Remote Meeting')} />
                            <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body bg-base responsive-padding-40-150">
                <div className="row gy-4">
                    <div className="col-lg-12">
                        {loading ? (
                            <div className="text-center">
                                <div className="xpo_h-200 xpo_xpo_flex xpo_justify-content-center xpo_xpo_items-center">
                                    <div className="xpo_relative">
                                        <p className="xpo_text-secondary xpo_text-xl">{__('Loading...')}</p>
                                    </div>
                                </div>
                            </div>
                        ) :
                        tickets.length === 0 ? (
                            <div className="text-center">
                                <div className="xpo_h-200 xpo_xpo_flex xpo_justify-content-center xpo_xpo_items-center">
                                    <div className="xpo_relative">
                                        <img src={emptyStreet} alt={__('No documents found')} className="xpo_w-100 xpo_h-100" />
                                        <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_xpo_flex xpo_justify-content-center xpo_xpo_items-center"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="accordion">
                                {tickets.map((ticket, index) => (
                                    <div className="accordion-item" key={index}>
                                        <h2 className="accordion-header">
                                            <button className={`accordion-button xpo_gap-3 ${active === ticket.id ? '' : 'collapsed'}`} type="button" onClick={() => setActive(active === ticket.id ? null : ticket.id)}>
                                                <span className="icon">
                                                    <TicketPlus className="text-xl" />
                                                </span>
                                                <span>{ticket.title} - {ticket.date}</span>
                                            </button>
                                        </h2>
                                        <div className={`accordion-collapse collapse ${active === ticket.id ? 'show' : ''}`}>
                                            <div className="accordion-body">
                                                {ticket.content}
                                                <div className="xpo_my-4 xpo_flex xpo_flex-wrap xpo_gap-3">
                                                    {ticket.attachements.map((file, index) => (
                                                        <a
                                                            key={index}
                                                            target="_blank"
                                                            href={forceHTTPS(file.file_url)}
                                                            download={file.file_name}
                                                            className="btn btn-outline-primary xpo_mt-4 ms-2 xpo_flex xpo_items-center xpo_gap-2"
                                                        >
                                                            <span>{shortenMiddle(file.file_name)}</span>
                                                            <span className="icon">
                                                                <Download className="text-xl" />
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

