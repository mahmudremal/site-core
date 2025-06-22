import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { home_url, rest_url, notify } from '@functions';
import request from '@common/request';
import { Bell, ChevronDown } from 'lucide-react';
import { useParams } from 'react-router-dom';
import faqImg from '@img/faq-img.png';

export default function PartnerDocsSingle({ post_type = 'partner_doc', post_taxonomy = 'partner_category', app_slug = 'partner-docs' }) {
    const { __ } = useTranslation();
    const { category_slug, doc_slug } = useParams();
    const [doc, setDoc] = useState({});
    const [active, setActive] = useState(null);

    useEffect(() => {
        request(rest_url(`sitecore/v1/docs/${post_type}/raw/${doc_slug}`))
        .then(res => setDoc(res))
        .catch(e => notify.error(e?.message??__('Error fetching partner docs.')));
    }, [post_type]);
    
    return (
        <div className="card basic-data-table">
            <div className="card-header xpo_p-0 border-0">
                <div className="responsive-padding-40-150 bg-primary-100">
                    <div className="row gy-4 xpo_items-center">
                        <div className="col-xl-7">
                            <h4 className="mb-20">{doc.post_title}</h4>        
                            <p className="mb-0 xpo_text-secondary-light xpo_max-w-634-px xpo_text-xl">{doc.post_excerpt}</p>
                        </div>
                        <div className="col-xl-5 d-xl-block d-none relative">
                            <img src={faqImg} alt={__('Remote Meeting')} />
                            <div className="absolute top-0 left-0 xpo_w-full xpo_h-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body bg-base responsive-padding-40-150">
                <div dangerouslySetInnerHTML={{__html: doc.post_content}}></div>
            </div>
        </div>
    )
}
