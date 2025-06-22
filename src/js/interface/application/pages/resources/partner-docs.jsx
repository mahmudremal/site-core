import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { home_url, rest_url, notify } from '@functions';
import request from '@common/request';
import { Bell, ChevronDown, SquareArrowOutUpRight } from 'lucide-react';
import faqImg from '@img/faq-img.png';
import emptyStreet from '@icons/empty-street.svg';

export default function PartnerDocs({ post_type = 'partner_doc', post_taxonomy = 'partner_category', app_slug = 'partner-docs', pageData = {} }) {
    const { __ } = useTranslation();
    const [pageTitle, setPageTitle] = useState(pageData?.title??__('Partnership documentations.'));
    const [pageDescription, setPageDescription] = useState(pageData?.description??__('Here we explained all necessery documentation and frequently asked questions regarding your partner program. Please find below or search them or if you didn\'t found any, please let us know.'));
    const [docs, setDocs] = useState([]);
    const [active, setActive] = useState(null);

    useEffect(() => {
        request(rest_url(`sitecore/v1/docs/${post_type}/${post_taxonomy}`))
        .then(res => {setDocs(res.list);setActive(res.list?.[0]?.id);})
        .catch(e => notify.error(e?.message??__('Error fetching partner docs.')));
    }, [post_type]);
    
    return (
        <div className="card basic-data-table">
            <div className="card-header xpo_p-0 border-0">
                <div className="responsive-padding-40-150 bg-primary-100">
                    <div className="row gy-4 xpo_items-center">
                        <div className="col-xl-7">
                            <h4 className="mb-20">{pageTitle}</h4>        
                            <p className="mb-0 xpo_text-secondary-light xpo_max-w-634-px xpo_text-xl">{pageDescription}</p>
                        </div>
                        <div className="col-xl-5 d-xl-block d-none relative">
                            <img src={faqImg} alt={__('Remote Meeting')} />
                            <div className="absolute top-0 left-0 xpo_w-full xpo_h-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body bg-base responsive-padding-40-150">
                <div className="row gy-4">
                    <div className="col-lg-12">
                        {docs.length === 0 ? (
                            <div className="text-center">
                                <div className="h-200 flex xpo_justify-content-center xpo_items-center">
                                    <div className="relative">
                                        <img src={emptyStreet} alt={__('No documents found')} className="w-100 xpo_h-100" />
                                        <div className="absolute top-0 left-0 xpo_w-full xpo_h-full flex xpo_justify-content-center xpo_items-center"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="accordion">
                                {docs.map((term, index) => (
                                    <div className="accordion-item" key={index}>
                                        <div className="accordion-header flex xpo_justify-between xpo_gap-5" onClick={() => setActive(prev => prev === term.id ? null : term.id)}>
                                            <div className="cursor-pointer">
                                                <h2>
                                                    <button className="accordion-button xpo_text-primary-light xpo_text-xl flex xpo_gap-2" type="button">
                                                        <span>{term.name}</span>
                                                        <Link to={home_url(`/resources/${app_slug}/${term.slug}`)} className="text-secondary-light xpo_text-xl">
                                                            <SquareArrowOutUpRight className="text-secondary-light xpo_text-xl xpo_h-4" />
                                                        </Link>
                                                    </button>
                                                </h2>
                                                <p>{term.description}</p>
                                            </div>
                                            <div>
                                                <span className="xpo_flex"><ChevronDown className={ `text-xl ${term.id === active && 'rotate-180'}` } /></span>
                                            </div>
                                        </div>
                                        <div className={`accordion-collapse collapse ${active === term.id && 'show'}`}>
                                            <div className="accordion-body">
                                                {term.docs.length === 0 ? <p className="text-secondary-light">{__('No documents found.')}</p> : (
                                                    <ul className="list-group xpo_mt-5">
                                                        {term.docs.map((doc, docIndex) => (
                                                            <li key={docIndex} className="list-group-item border xpo_text-secondary-light xpo_p-16 bg-base border-bottom-0">
                                                                <div className="xpo_flex xpo_items-center xpo_gap-2">
                                                                    <Link to={home_url(`/resources/${app_slug}/${term.slug}/${doc.slug}`)} className="text-decoration-none flex xpo_items-center xpo_gap-2">
                                                                        <span className="xpo_flex"><Bell className="text-xl" /></span>
                                                                        <span className="text-primary-light xpo_text-xl">{doc.title}</span>
                                                                    </Link>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
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
