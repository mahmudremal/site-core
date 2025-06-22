import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { home_route, roles } from '@functions';
import { useTranslation } from '@context/LanguageProvider';

// Lazy-loaded components
const Home = lazy(() => import('./pages/home'));
const NoAccess = lazy(() => import('@components/element/noaccess.jsx'));

const ErrorPage = lazy(() => import('./pages/error'));

const ReferralsScreen = lazy(() => import('./pages/referrals'));
const Referral_View = lazy(() => import('./pages/referrals/view'));

const Active_Referrals = lazy(() => import('./pages/referrals/active'));
const Inactive_Referrals = lazy(() => import('./pages/referrals/inactive'));

const UsersList = lazy(() => import('./pages/users/list'));
const UsersGrid = lazy(() => import('./pages/users/grid'));
const UsersView = lazy(() => import('./pages/users/view'));
const UsersEdit = lazy(() => import('./pages/users/edit'));

const PayoutsScreen = lazy(() => import('./pages/payouts/screen'));
const Settings = lazy(() => import('./pages/settings'));

const PartnerDocs = lazy(() => import('./pages/resources/partner-docs'));
const PartnerDocsCategory = lazy(() => import('./pages/resources/partner-docs-category'));
const PartnerDocsSingle = lazy(() => import('./pages/resources/partner-docs-single'));

const ServiceDocs = lazy(() => import('./pages/resources/service-docs'));
const ServiceDocsCategory = lazy(() => import('./pages/resources/service-docs-category'));
const ServiceDocsSingle = lazy(() => import('./pages/resources/service-docs-single'));

const Supports = lazy(() => import('./pages/support/supports'));
const OpenTicket = lazy(() => import('./pages/support/open-ticket'));

const Contracts = lazy(() => import('./pages/contracts'));
const Contracts_Actives = lazy(() => import('./pages/contracts/active'));
const Contracts_Inactives = lazy(() => import('./pages/contracts/inactive'));
const Contract_Board = lazy(() => import('./pages/contracts/board'));

const Packages = lazy(() => import('./pages/packages'));
const Checkout = lazy(() => import('./pages/packages/checkout'));

const Invoices = lazy(() => import('./pages/invoices'));
const InvoiceEdit = lazy(() => import('./pages/invoices/edit'));
const InvoiceCheckout = lazy(() => import('./pages/invoices/checkout'));

const Stores = lazy(() => import('./pages/stores'));


export default function Content() {
    const { __ } = useTranslation();
    return (
        <div className="xpo_w-full">
            <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                <Routes>
                    <Route path={home_route('/')} element={!roles.has_ability('project_manager') ? (<NoAccess />) : (<Home />)} />
                    <Route path={home_route('/insights')} element={!roles.has_ability('project_manager') ? (<NoAccess />) : (<Home />)} />
                    <Route path={home_route('/sales')} element={!roles.has_ability('project_manager') ? (<NoAccess />) : (<Home />)} />
                    <Route path={home_route('/analytics')} element={!roles.has_ability('read') ? (<NoAccess />) : (<Home />)} />

                    <Route path={home_route('/users')} element={!roles.has_ability('project_manager', 'users') ? (<NoAccess />) : (<UsersList />)} />
                    <Route path={home_route('/users/:userid/view')} element={<UsersView />} />
                    <Route path={home_route('/users/:userid/edit')} element={<UsersEdit />} />

                    <Route path={home_route('/stores')} element={!roles.has_ability('stores') ? (<NoAccess />) : (<Stores />)} />

                    <Route path={home_route('/resources/partner-docs')} element={!roles.has_ability('partner-docs') ? (<NoAccess />) : (<PartnerDocs/>)} />
                    <Route path={home_route('/resources/partner-docs/:category_slug')} element={!roles.has_ability('partner-docs') ? (<NoAccess />) : (<PartnerDocsCategory/>)} />
                    <Route path={home_route('/resources/partner-docs/:category_slug/:doc_slug')} element={!roles.has_ability('partner-docs') ? (<NoAccess />) : (<PartnerDocsSingle/>)} />
                    
                    <Route path={home_route('/resources/service-docs')} element={!roles.has_ability('service-docs') ? (<NoAccess />) : (<ServiceDocs />)} handle={{ breadcrumb: 'Service Documentations' }} />
                    <Route path={home_route('/resources/service-docs/:category_slug')} element={!roles.has_ability('service-docs') ? (<NoAccess />) : (<ServiceDocsCategory />)} />
                    <Route path={home_route('/resources/service-docs/:category_slug/:doc_slug')} element={!roles.has_ability('service-docs') ? (<NoAccess />) : (<ServiceDocsSingle />)} />

                    <Route path={home_route('/support/supports')} element={!roles.has_ability('support-ticket') ? (<NoAccess />) : (<Supports />)} />
                    <Route path={home_route('/support/open-ticket')} element={!roles.has_ability('support-ticket') ? (<NoAccess />) : (<OpenTicket />)} />

                    <Route path={home_route('/referrals')} element={!roles.has_ability('referral') ? (<NoAccess />) : (<ReferralsScreen />)} />
                    <Route path={home_route('/referrals/active')} element={!roles.has_ability('referral') ? (<NoAccess />) : (<Active_Referrals />)} />
                    <Route path={home_route('/referrals/inactive')} element={!roles.has_ability('referral') ? (<NoAccess />) : (<Inactive_Referrals />)} />
                    <Route path={home_route('/referrals/:referral_id/view')} element={!roles.has_ability('referral') ? (<NoAccess />) : (<Referral_View />)} />
                    
                    <Route path={home_route('/packages')} element={!roles.has_ability('packages') ? (<NoAccess />) : (<Packages />)} />
                    <Route path={home_route('/packages/:package_id/:pricing_plan/checkout')} element={!roles.has_ability('packages') ? (<NoAccess />) : (<Checkout />)} />
                    
                    <Route path={home_route('/contracts')} element={!roles.has_ability('contracts') ? (<NoAccess />) : (<Contracts />)} />
                    <Route path={home_route('/contracts/active')} element={!roles.has_ability('contracts') ? (<NoAccess />) : (<Contracts_Actives />)} />
                    <Route path={home_route('/contracts/archive')} element={!roles.has_ability('contracts') ? (<NoAccess />) : (<Contracts_Inactives />)} />
                    <Route path={home_route('/contracts/:contract_id/board')} element={!roles.has_ability('contracts') ? (<NoAccess />) : (<Contract_Board />)} />

                    <Route path={home_route('/payouts')} element={!roles.has_ability('payouts') ? (<NoAccess />) : (<PayoutsScreen />)} />
                    <Route path={home_route('/settings')} element={<Settings />} />
                    <Route path={home_route('/team')} element={!roles.has_ability('team') ? (<NoAccess />) : (<UsersGrid />)} />


                    <Route path={home_route('/invoices')} element={!roles.has_ability('invoices') ? (<NoAccess />) : (<Invoices />)} />
                    <Route path={home_route('/invoices/:invoice_id/view')} element={!roles.has_ability('invoices') ? (<NoAccess />) : (<InvoiceEdit />)} />
                    <Route path={home_route('/invoices/:invoice_id/checkout')} element={!roles.has_ability('invoices') ? (<NoAccess />) : (<InvoiceCheckout />)} />

                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </div>
    );
}
