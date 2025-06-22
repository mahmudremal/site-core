import React from 'react';
import PartnerDocsCategory from './partner-docs-category';

export default function ServiceDocsCategory() {
    return <PartnerDocsCategory post_type={'service_doc'} post_taxonomy={'service_category'} app_slug={'service-docs'} />
}
