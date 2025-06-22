import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { home_url, rest_url, notify } from '@functions';
import request from '@common/request';
import { Bell } from 'lucide-react';
import { useParams } from 'react-router-dom';
import faqImg from '@img/faq-img.png';
import emptyStreet from '@icons/empty-street.svg';

export default function PartnerDocsCategory({ post_type = 'partner_doc', post_taxonomy = 'partner_category', app_slug = 'partner-docs' }) {
    const { __ } = useTranslation();
    const { category_slug } = useParams();
    const [category, setCategory] = useState([]);
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        request(rest_url(`sitecore/v1/docs/${post_type}/${post_taxonomy}/${category_slug}`))
        .then(res => res.list)
        .then(res => {
            setCategory(res.category);
            setDocs(res.posts);
        })
        .catch(e => notify.error(e?.message??__('Error fetching partner docs.')));
    }, [post_type]);
    
    return (
        <div className="card basic-data-table">
            <div className="card-header xpo_p-0 border-0">
                <div className="responsive-padding-40-150 bg-light-pink">
                    <div className="row gy-4 xpo_items-center">
                        <div className="col-xl-7">
                            <h4 className="mb-20">{category.name}</h4>        
                            <p className="mb-0 xpo_text-secondary-light xpo_max-w-634-px xpo_text-xl">{category.description}</p>
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
                            <ul className="list-group xpo_mt-5">
                                {docs.map((doc, docIndex) => (
                                    <li className="list-group-item border xpo_text-secondary-light xpo_p-16 bg-base">
                                        <div key={docIndex} className="gap-2">
                                            <Link to={home_url(`/resources/${app_slug}/${category_slug}/${doc.slug}`)} className="text-decoration-none flex xpo_items-center xpo_gap-2">
                                                <span className="xpo_flex"><Bell className="text-xl" /></span>
                                                <span className="text-primary-light xpo_text-xl">{doc.title}</span>
                                            </Link>
                                            <p>{doc.excerpt}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
