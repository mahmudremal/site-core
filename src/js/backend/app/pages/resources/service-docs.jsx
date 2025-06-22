import React from 'react';
import { useTranslation } from '@context/LanguageProvider';
import PartnerDocs from './partner-docs';

export default function ServiceDocs() {
    const { __ } = useTranslation();
    const pageData = {
        title: __('Services explained!'),
        description: __('Here we explained all necessary documentation and frequently asked questions regarding your service program. Please find below or search them or if you didn\'t found any, please let us know.')
    };
    
    return <PartnerDocs post_type={'service_doc'} post_taxonomy={'service_category'} app_slug={'service-docs'} pageData={pageData} />
}
