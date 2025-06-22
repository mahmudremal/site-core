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

const Site = lazy(() => import('./pages/sites/site'));
const Sites = lazy(() => import('./pages/sites'));
const SiteOrders = lazy(() => import('./pages/sites/orders'));
const SiteUsers = lazy(() => import('./pages/sites/users'));
const SiteUserView = lazy(() => import('./pages/users/view'));
const SiteEntries = lazy(() => import('./pages/sites/entries'));
const SitePostTypes = lazy(() => import('./pages/sites/post-types'));
const SitePosts = lazy(() => import('./pages/sites/posts'));
const SitePost = lazy(() => import('./pages/sites/post'));
const Planner = lazy(() => import('./pages/sites/ai/planner'));
const AIJobs = lazy(() => import('./pages/sites/ai/jobs'));
const AIJobsType = lazy(() => import('./pages/sites/ai/jobs-type'));
const AIJobsStatus = lazy(() => import('./pages/sites/ai/jobs-status'));


export default function Content() {
    const { __ } = useTranslation();
    return (
        <div className="w-full xpo_p-[15px] min-h-[calc(100vh-72px*3)]">
            <Suspense fallback={<div className="text-center xpo_p-4">{__('Loading...')}</div>}>
                <Routes>
                    <Route path={home_route('/')} element={<Home />} />
                    <Route path={home_route('/insights')} element={<Home />} />
                    <Route path={home_route('/sales')} element={<Home />} />
                    <Route path={home_route('/analytics')} element={<Home />} />

                    <Route path={home_route('/users')} element={<UsersList />} />
                    <Route path={home_route('/users/:userid/view')} element={<UsersView />} />
                    <Route path={home_route('/users/:userid/edit')} element={<UsersEdit />} />

                    <Route path={home_route('/stores')} element={<Stores />} />

                    <Route path={home_route('/resources/partner-docs')} element={<PartnerDocs/>} />
                    <Route path={home_route('/resources/partner-docs/:category_slug')} element={<PartnerDocsCategory/>} />
                    <Route path={home_route('/resources/partner-docs/:category_slug/:doc_slug')} element={<PartnerDocsSingle/>} />
                    
                    <Route path={home_route('/resources/service-docs')} element={<ServiceDocs />} handle={{ breadcrumb: __('Service Documentations') }} />
                    <Route path={home_route('/resources/service-docs/:category_slug')} element={<ServiceDocsCategory />} />
                    <Route path={home_route('/resources/service-docs/:category_slug/:doc_slug')} element={<ServiceDocsSingle />} />

                    <Route path={home_route('/support/supports')} element={<Supports />} />
                    <Route path={home_route('/support/open-ticket')} element={<OpenTicket />} />

                    <Route path={home_route('/referrals')} element={<ReferralsScreen />} />
                    <Route path={home_route('/referrals/active')} element={<Active_Referrals />} />
                    <Route path={home_route('/referrals/inactive')} element={<Inactive_Referrals />} />
                    <Route path={home_route('/referrals/:referral_id/view')} element={<Referral_View />} />
                    
                    <Route path={home_route('/packages')} element={<Packages />} />
                    <Route path={home_route('/packages/:package_id/:pricing_plan/checkout')} element={<Checkout />} />
                    
                    <Route path={home_route('/contracts')} element={<Contracts />} />
                    <Route path={home_route('/contracts/active')} element={<Contracts_Actives />} />
                    <Route path={home_route('/contracts/archive')} element={<Contracts_Inactives />} />
                    <Route path={home_route('/contracts/:contract_id/board')} element={<Contract_Board />} />

                    <Route path={home_route('/payouts')} element={<PayoutsScreen />} />
                    <Route path={home_route('/settings')} element={<Settings />} />
                    <Route path={home_route('/team')} element={<UsersGrid />} />


                    <Route path={home_route('/invoices')} element={<Invoices />} />
                    <Route path={home_route('/invoices/:invoice_id/view')} element={<InvoiceEdit />} />
                    <Route path={home_route('/invoices/:invoice_id/checkout')} element={<InvoiceCheckout />} />

                    
                    <Route path={home_route('/sites')} element={<Sites />} />
                    <Route path={home_route('/sites/:site_id')} element={<Site />} />
                    <Route path={home_route('/sites/:site_id/entries')} element={<SiteEntries />} />
                    <Route path={home_route('/sites/:site_id/orders')} element={<SiteOrders />} />
                    <Route path={home_route('/sites/:site_id/users')} element={<SiteUsers />} />
                    <Route path={home_route('/sites/:site_id/users/:userid')} element={<SiteUserView />} />
                    <Route path={home_route('/sites/:site_id/posttypes')} element={<SitePostTypes />} />
                    <Route path={home_route('/sites/:site_id/posttypes/:post_type')} element={<SitePosts />} />
                    <Route path={home_route('/sites/:site_id/posttypes/:post_type/:post_id')} element={<SitePost />} />

                    <Route path={home_route('/sites/:site_id/planner')} element={<Planner />} />
                    <Route path={home_route('/sites/:site_id/jobs')} element={<AIJobs />} />
                    <Route path={home_route('/sites/:site_id/jobs/types/:jobs_type')} element={<AIJobsType />} />
                    <Route path={home_route('/sites/:site_id/jobs/status/:jobs_status')} element={<AIJobsStatus />} />

                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </div>
    );
}
