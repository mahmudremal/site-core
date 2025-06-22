import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { Award, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Icon } from '@iconify/react/dist/iconify.js';

export default function Home({ setLoading }) {
    const { __ } = useTranslation();
    return (
        <>
            {/* Overview cards */}
            <div className="xpo_flex xpo_flex-col xpo_gap-5">
                <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
                    <div className="col">
                        <div className="card shadow-none border bg-gradient-start-1 xpo_h-100">
                            <div className="card-body xpo_p-20">
                                <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between xpo_gap-3">
                                    <div>
                                        <p className="fw-medium xpo_text-primary-light xpo_mb-1">Total Users</p>
                                        <h6 className="mb-0">20,000</h6>
                                    </div>
                                    <div className="w-50-px xpo_h-50-px bg-cyan rounded-circle xpo_flex xpo_justify-content-center xpo_items-center">
                                        <Users className="text-white xpo_text-2xl xpo_mb-0" />
                                    </div>
                                </div>
                                <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 xpo_flex xpo_items-center xpo_gap-2">
                                <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main"><ChevronUp className="text-xs" /> +5000</span> 
                                Last 30 days users
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card shadow-none border bg-gradient-start-2 xpo_h-100">
                            <div className="card-body xpo_p-20">
                                <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between xpo_gap-3">
                                    <div>
                                        <p className="fw-medium xpo_text-primary-light xpo_mb-1">Total Subscription</p>
                                        <h6 className="mb-0">15,000</h6>
                                    </div>
                                    <div className="w-50-px xpo_h-50-px bg-purple rounded-circle xpo_flex xpo_justify-content-center xpo_items-center">
                                        <Award className="text-white xpo_text-2xl xpo_mb-0" />
                                    </div>
                                </div>
                                <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 xpo_flex xpo_items-center xpo_gap-2">
                                <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-danger-main"><ChevronDown className="text-xs" /> -800</span> 
                                Last 30 days subscription
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card shadow-none border bg-gradient-start-3 xpo_h-100">
                            <div className="card-body xpo_p-20">
                                <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between xpo_gap-3">
                                    <div>
                                        <p className="fw-medium xpo_text-primary-light xpo_mb-1">Total Free Users</p>
                                        <h6 className="mb-0">5,000</h6>
                                    </div>
                                    <div className="w-50-px xpo_h-50-px bg-info rounded-circle xpo_flex xpo_justify-content-center xpo_items-center">
                                        <Icon icon="fluent:people-20-filled" className="text-white xpo_text-2xl xpo_mb-0" />
                                    </div>
                                </div>
                                <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 xpo_flex xpo_items-center xpo_gap-2">
                                <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main"><Icon icon="bxs:up-arrow" className="text-xs" /> +200</span> 
                                Last 30 days users
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card shadow-none border bg-gradient-start-4 xpo_h-100">
                            <div className="card-body xpo_p-20">
                                <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between xpo_gap-3">
                                    <div>
                                        <p className="fw-medium xpo_text-primary-light xpo_mb-1">Total Income</p>
                                        <h6 className="mb-0">$42,000</h6>
                                    </div>
                                    <div className="w-50-px xpo_h-50-px bg-success-main rounded-circle xpo_flex xpo_justify-content-center xpo_items-center">
                                        <Icon icon="solar:wallet-bold" className="text-white xpo_text-2xl xpo_mb-0" />
                                    </div>
                                </div>
                                <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 xpo_flex xpo_items-center xpo_gap-2">
                                <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main"><Icon icon="bxs:up-arrow" className="text-xs" /> +$20,000</span> 
                                Last 30 days income
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card shadow-none border bg-gradient-start-5 xpo_h-100">
                            <div className="card-body xpo_p-20">
                                <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between xpo_gap-3">
                                    <div>
                                        <p className="fw-medium xpo_text-primary-light xpo_mb-1">Total Expense</p>
                                        <h6 className="mb-0">$30,000</h6>
                                    </div>
                                    <div className="w-50-px xpo_h-50-px bg-red rounded-circle xpo_flex xpo_justify-content-center xpo_items-center">
                                        <Icon icon="fa6-solid:file-invoice-dollar" className="text-white xpo_text-2xl xpo_mb-0" />
                                    </div>
                                </div>
                                <p className="fw-medium xpo_text-sm xpo_text-primary-light xpo_mt-12 xpo_mb-0 xpo_flex xpo_items-center xpo_gap-2">
                                <span className="d-inline-flex xpo_items-center xpo_gap-1 xpo_text-success-main"><Icon icon="bxs:up-arrow" className="text-xs" /> +$5,000</span> 
                                Last 30 days expense
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row xpo_px-0 row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
                    <div className="row xpo_px-0 gy-4 xpo_mt-1 xpo_w-full">
                        <div className="col-xxl-6 col-xl-12">
                            <div className="card xpo_h-100">
                                <div className="card-body">
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between">
                                        <h6 className="text-lg xpo_mb-0">Sales Statistic</h6>
                                        <select className="form-select bg-base form-select-sm xpo_w-auto">
                                            <option>Yearly</option>
                                            <option>Monthly</option>
                                            <option>Weekly</option>
                                            <option>Today</option>
                                        </select>
                                    </div>
                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_gap-2 xpo_mt-8">
                                        <h6 className="mb-0">$27,200</h6>
                                        <span className="text-sm fw-semibold rounded-pill bg-success-focus xpo_text-success-main border br-success px-8 py-4 line-height-1 xpo_flex xpo_items-center xpo_gap-1">
                                            10% <Icon icon="bxs:up-arrow" className="text-xs" />
                                        </span>
                                        <span className="text-xs fw-medium">+ $1500 Per Day</span>
                                    </div>
                                    <div id="chart" className="pt-28 apexcharts-tooltip-style-1"></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xxl-3 col-xl-6">
                            <div className="card xpo_h-100 radius-8 border">
                                <div className="card-body xpo_p-24">
                                    <h6 className="mb-12 fw-semibold xpo_text-lg xpo_mb-16">Total Subscriber</h6>
                                    <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-20">
                                        <h6 className="fw-semibold xpo_mb-0">5,000</h6>
                                        <p className="text-sm xpo_mb-0">
                                            <span className="bg-danger-focus border br-danger px-8 py-2 rounded-pill fw-semibold xpo_text-danger-main xpo_text-sm d-inline-flex xpo_items-center xpo_gap-1">
                                                10%
                                                <Icon icon="iconamoon:arrow-down-2-fill" className="icon" />  
                                            </span> 
                                            - 20 Per Day 
                                        </p>
                                    </div>

                                    <div id="barChart" className="barChart"></div>
                                    
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-xxl-3 col-xl-6">
                            <div className="card xpo_h-100 radius-8 border-0 overflow-hidden">
                                <div className="card-body xpo_p-24">
                                    <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-content-between">
                                        <h6 className="mb-2 fw-bold xpo_text-lg">Users Overview</h6>
                                        <div className="">
                                            <select className="form-select form-select-sm xpo_w-auto bg-base border xpo_text-secondary-light">
                                                <option>Today</option>
                                                <option>Weekly</option>
                                                <option>Monthly</option>
                                                <option>Yearly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div id="userOverviewDonutChart" className="apexcharts-tooltip-z-none"></div>

                                    <ul className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-content-between xpo_mt-3 xpo_gap-3">
                                        <li className="xpo_flex xpo_items-center xpo_gap-2">
                                            <span className="w-12-px xpo_h-12-px radius-2 bg-primary-600"></span>
                                            <span className="text-secondary-light xpo_text-sm fw-normal">New: 
                                                <span className="text-primary-light fw-semibold">500</span>
                                            </span>
                                        </li>
                                        <li className="xpo_flex xpo_items-center xpo_gap-2">
                                            <span className="w-12-px xpo_h-12-px radius-2 bg-yellow"></span>
                                            <span className="text-secondary-light xpo_text-sm fw-normal">Subscribed:  
                                                <span className="text-primary-light fw-semibold">300</span>
                                            </span>
                                        </li>
                                    </ul>
                                    
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-xxl-9 col-xl-12">
                            <div className="card xpo_h-100">
                                <div className="card-body xpo_p-24">

                                    <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_gap-1 xpo_justify-content-between xpo_mb-16">
                                        <ul className="nav border-gradient-tab nav-pills xpo_mb-0" id="pills-tab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link xpo_flex xpo_items-center active" id="pills-to-do-list-tab" data-bs-toggle="pill" data-bs-target="#pills-to-do-list" type="button" role="tab" aria-controls="pills-to-do-list" aria-selected="true">
                                                    Latest Registered 
                                                    <span className="text-sm fw-semibold py-6 px-12 bg-neutral-500 rounded-pill xpo_text-white line-height-1 ms-12 notification-alert">35</span>
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link xpo_flex xpo_items-center" id="pills-recent-leads-tab" data-bs-toggle="pill" data-bs-target="#pills-recent-leads" type="button" role="tab" aria-controls="pills-recent-leads" aria-selected="false" tabIndex="-1">
                                                    Latest Subscribe 
                                                    <span className="text-sm fw-semibold py-6 px-12 bg-neutral-500 rounded-pill xpo_text-white line-height-1 ms-12 notification-alert">35</span>
                                                </button>
                                            </li>
                                        </ul>
                                        <Link to="#" className="text-primary-600 hover-text-primary xpo_flex xpo_items-center xpo_gap-1">
                                            View All
                                            <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                                        </Link>
                                    </div>

                                    <div className="tab-content" id="pills-tabContent">   
                                        <div className="tab-pane fade show active" id="pills-to-do-list" role="tabpanel" aria-labelledby="pills-to-do-list-tab" tabIndex="0">
                                        <div className="table-responsive scroll-sm">
                                            <table className="table bordered-table sm-table xpo_mb-0">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Users </th>
                                                        <th scope="col">Registered On</th>
                                                        <th scope="col">Plan</th>
                                                        <th scope="col" className="text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <div className="xpo_flex xpo_items-center">
                                                                <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                <div className="xpo_flex-grow-1">
                                                                    <h6 className="text-md xpo_mb-0 fw-medium">Dianne Russell</h6>
                                                                    <span className="text-sm xpo_text-secondary-light fw-medium">redaniel@gmail.com</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>27 Mar 2024</td>
                                                        <td>Free</td>
                                                        <td className="text-center"> 
                                                            <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="xpo_flex xpo_items-center">
                                                                <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                <div className="xpo_flex-grow-1">
                                                                    <h6 className="text-md xpo_mb-0 fw-medium">Wade Warren</h6>
                                                                    <span className="text-sm xpo_text-secondary-light fw-medium">xterris@gmail.com</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>27 Mar 2024</td>
                                                        <td>Basic</td>
                                                        <td className="text-center"> 
                                                            <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="xpo_flex xpo_items-center">
                                                                <img src="https://randomuser.me/api/portraits/men/3.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                <div className="xpo_flex-grow-1">
                                                                    <h6 className="text-md xpo_mb-0 fw-medium">Albert Flores</h6>
                                                                    <span className="text-sm xpo_text-secondary-light fw-medium">seannand@mail.ru</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>27 Mar 2024</td>
                                                        <td>Standard</td>
                                                        <td className="text-center"> 
                                                            <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="xpo_flex xpo_items-center">
                                                                <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                <div className="xpo_flex-grow-1">
                                                                    <h6 className="text-md xpo_mb-0 fw-medium">Bessie Cooper </h6>
                                                                    <span className="text-sm xpo_text-secondary-light fw-medium">igerrin@gmail.com</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>27 Mar 2024</td>
                                                        <td>Business</td>
                                                        <td className="text-center"> 
                                                            <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="xpo_flex xpo_items-center">
                                                                <img src="https://randomuser.me/api/portraits/men/5.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                <div className="xpo_flex-grow-1">
                                                                    <h6 className="text-md xpo_mb-0 fw-medium">Arlene McCoy</h6>
                                                                    <span className="text-sm xpo_text-secondary-light fw-medium">fellora@mail.ru</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>27 Mar 2024</td>
                                                        <td>Enterprise </td>
                                                        <td className="text-center"> 
                                                            <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        </div>
                                        <div className="tab-pane fade" id="pills-recent-leads" role="tabpanel" aria-labelledby="pills-recent-leads-tab" tabIndex="0">
                                            <div className="table-responsive scroll-sm">
                                                <table className="table bordered-table sm-table xpo_mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Users </th>
                                                            <th scope="col">Registered On</th>
                                                            <th scope="col">Plan</th>
                                                            <th scope="col" className="text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="xpo_flex xpo_items-center">
                                                                    <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                    <div className="xpo_flex-grow-1">
                                                                        <h6 className="text-md xpo_mb-0 fw-medium">Dianne Russell</h6>
                                                                        <span className="text-sm xpo_text-secondary-light fw-medium">redaniel@gmail.com</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>27 Mar 2024</td>
                                                            <td>Free</td>
                                                            <td className="text-center"> 
                                                                <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div className="xpo_flex xpo_items-center">
                                                                    <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                    <div className="xpo_flex-grow-1">
                                                                        <h6 className="text-md xpo_mb-0 fw-medium">Wade Warren</h6>
                                                                        <span className="text-sm xpo_text-secondary-light fw-medium">xterris@gmail.com</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>27 Mar 2024</td>
                                                            <td>Basic</td>
                                                            <td className="text-center"> 
                                                                <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div className="xpo_flex xpo_items-center">
                                                                    <img src="https://randomuser.me/api/portraits/men/3.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                    <div className="xpo_flex-grow-1">
                                                                        <h6 className="text-md xpo_mb-0 fw-medium">Albert Flores</h6>
                                                                        <span className="text-sm xpo_text-secondary-light fw-medium">seannand@mail.ru</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>27 Mar 2024</td>
                                                            <td>Standard</td>
                                                            <td className="text-center"> 
                                                                <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div className="xpo_flex xpo_items-center">
                                                                    <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                    <div className="xpo_flex-grow-1">
                                                                        <h6 className="text-md xpo_mb-0 fw-medium">Bessie Cooper </h6>
                                                                        <span className="text-sm xpo_text-secondary-light fw-medium">igerrin@gmail.com</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>27 Mar 2024</td>
                                                            <td>Business</td>
                                                            <td className="text-center"> 
                                                                <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div className="xpo_flex xpo_items-center">
                                                                    <img src="https://randomuser.me/api/portraits/men/5.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                                    <div className="xpo_flex-grow-1">
                                                                        <h6 className="text-md xpo_mb-0 fw-medium">Arlene McCoy</h6>
                                                                        <span className="text-sm xpo_text-secondary-light fw-medium">fellora@mail.ru</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>27 Mar 2024</td>
                                                            <td>Enterprise </td>
                                                            <td className="text-center"> 
                                                                <span className="bg-success-focus xpo_text-success-main px-24 py-4 rounded-pill fw-medium xpo_text-sm">Active</span> 
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-xxl-3 col-xl-12">
                            <div className="card xpo_h-100">
                                <div className="card-body">
                                    <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-content-between">
                                        <h6 className="mb-2 fw-bold xpo_text-lg xpo_mb-0">Top Performer</h6>
                                        <Link to="#" className="text-primary-600 hover-text-primary xpo_flex xpo_items-center xpo_gap-1">
                                            View All
                                            <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                                        </Link>
                                    </div>

                                    <div className="mt-32">

                                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-24">
                                            <div className="xpo_flex xpo_items-center">
                                                <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                <div className="xpo_flex-grow-1">
                                                    <h6 className="text-md xpo_mb-0 fw-medium">Dianne Russell</h6>
                                                    <span className="text-sm xpo_text-secondary-light fw-medium">Agent ID: 36254</span>
                                                </div>
                                            </div>
                                            <span className="text-primary-light xpo_text-md fw-medium">$20</span>
                                        </div>

                                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-24">
                                            <div className="xpo_flex xpo_items-center">
                                                <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                <div className="xpo_flex-grow-1">
                                                    <h6 className="text-md xpo_mb-0 fw-medium">Wade Warren</h6>
                                                    <span className="text-sm xpo_text-secondary-light fw-medium">Agent ID: 36254</span>
                                                </div>
                                            </div>
                                            <span className="text-primary-light xpo_text-md fw-medium">$20</span>
                                        </div>

                                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-24">
                                            <div className="xpo_flex xpo_items-center">
                                                <img src="https://randomuser.me/api/portraits/men/3.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                <div className="xpo_flex-grow-1">
                                                    <h6 className="text-md xpo_mb-0 fw-medium">Albert Flores</h6>
                                                    <span className="text-sm xpo_text-secondary-light fw-medium">Agent ID: 36254</span>
                                                </div>
                                            </div>
                                            <span className="text-primary-light xpo_text-md fw-medium">$30</span>
                                        </div>

                                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-24">
                                            <div className="xpo_flex xpo_items-center">
                                                <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                <div className="xpo_flex-grow-1">
                                                    <h6 className="text-md xpo_mb-0 fw-medium">Bessie Cooper</h6>
                                                    <span className="text-sm xpo_text-secondary-light fw-medium">Agent ID: 36254</span>
                                                </div>
                                            </div>
                                            <span className="text-primary-light xpo_text-md fw-medium">$40</span>
                                        </div>

                                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-24">
                                            <div className="xpo_flex xpo_items-center">
                                                <img src="https://randomuser.me/api/portraits/men/5.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                <div className="xpo_flex-grow-1">
                                                    <h6 className="text-md xpo_mb-0 fw-medium">Arlene McCoy</h6>
                                                    <span className="text-sm xpo_text-secondary-light fw-medium">Agent ID: 36254</span>
                                                </div>
                                            </div>
                                            <span className="text-primary-light xpo_text-md fw-medium">$10</span>
                                        </div>

                                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3">
                                            <div className="xpo_flex xpo_items-center">
                                                <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                                <div className="xpo_flex-grow-1">
                                                    <h6 className="text-md xpo_mb-0 fw-medium">Arlene McCoy</h6>
                                                    <span className="text-sm xpo_text-secondary-light fw-medium">Agent ID: 36254</span>
                                                </div>
                                            </div>
                                            <span className="text-primary-light xpo_text-md fw-medium">$10</span>
                                        </div>

                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-xxl-6 col-xl-12">
                            <div className="card xpo_h-100">
                                <div className="card-body">
                                    <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-content-between xpo_mb-20">
                                        <h6 className="mb-2 fw-bold xpo_text-lg xpo_mb-0">Top Countries</h6>
                                        <select className="form-select form-select-sm xpo_w-auto bg-base border xpo_text-secondary-light">
                                            <option>Today</option>
                                            <option>Weekly</option>
                                            <option>Monthly</option>
                                            <option>Yearly</option>
                                        </select>
                                    </div>

                                    <div className="row xpo_px-0 gy-4">
                                        <div className="col-lg-6">
                                            <div id="world-map" className="h-100 border radius-8"></div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="h-100 border xpo_p-16 pe-0 radius-8">
                                                <div className="max-h-266-px overflow-y-auto scroll-sm pe-16">
                                                    <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-12 xpo_pb-2">
                                                        <div className="xpo_flex xpo_items-center xpo_w-100">
                                                            <img src="https://flagcdn.com/48x36/us.png" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12" />
                                                            <div className="xpo_flex-grow-1">
                                                                <h6 className="text-sm xpo_mb-0">USA</h6>
                                                                <span className="text-xs xpo_text-secondary-light fw-medium">1,240 Users</span>
                                                            </div>
                                                        </div>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                                            <div className="w-100 xpo_max-w-66 ms-auto">
                                                                <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                                    <div className="progress-bar bg-primary-600 rounded-pill" style={{width: '80%'}}></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-secondary-light font-xs fw-semibold">80%</span>
                                                        </div>
                                                    </div>
                                    
                                                    <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-12 xpo_pb-2">
                                                        <div className="xpo_flex xpo_items-center xpo_w-100">
                                                            <img src="https://flagcdn.com/48x36/jp.png" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12" />
                                                            <div className="xpo_flex-grow-1">
                                                                <h6 className="text-sm xpo_mb-0">Japan</h6>
                                                                <span className="text-xs xpo_text-secondary-light fw-medium">1,240 Users</span>
                                                            </div>
                                                        </div>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                                            <div className="w-100 xpo_max-w-66 ms-auto">
                                                                <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                                    <div className="progress-bar bg-orange rounded-pill" style={{width: '60%'}}></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-secondary-light font-xs fw-semibold">60%</span>
                                                        </div>
                                                    </div>
                                    
                                                    <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-12 xpo_pb-2">
                                                        <div className="xpo_flex xpo_items-center xpo_w-100">
                                                            <img src="https://flagcdn.com/48x36/fr.png" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12" />
                                                            <div className="xpo_flex-grow-1">
                                                                <h6 className="text-sm xpo_mb-0">France</h6>
                                                                <span className="text-xs xpo_text-secondary-light fw-medium">1,240 Users</span>
                                                            </div>
                                                        </div>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                                            <div className="w-100 xpo_max-w-66 ms-auto">
                                                                <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                                    <div className="progress-bar bg-yellow rounded-pill" style={{width: '49%'}}></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-secondary-light font-xs fw-semibold">49%</span>
                                                        </div>
                                                    </div>
                                    
                                                    <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-12 xpo_pb-2">
                                                        <div className="xpo_flex xpo_items-center xpo_w-100">
                                                            <img src="https://flagcdn.com/48x36/gr.png" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12" />
                                                            <div className="xpo_flex-grow-1">
                                                                <h6 className="text-sm xpo_mb-0">Germany</h6>
                                                                <span className="text-xs xpo_text-secondary-light fw-medium">1,240 Users</span>
                                                            </div>
                                                        </div>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                                            <div className="w-100 xpo_max-w-66 ms-auto">
                                                                <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                                    <div className="progress-bar bg-success-main rounded-pill" style={{width: '100%'}}></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-secondary-light font-xs fw-semibold">100%</span>
                                                        </div>
                                                    </div>
                                    
                                                    <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3 xpo_mb-12 xpo_pb-2">
                                                        <div className="xpo_flex xpo_items-center xpo_w-100">
                                                            <img src="https://flagcdn.com/48x36/sk.png" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12" />
                                                            <div className="xpo_flex-grow-1">
                                                                <h6 className="text-sm xpo_mb-0">South Korea</h6>
                                                                <span className="text-xs xpo_text-secondary-light fw-medium">1,240 Users</span>
                                                            </div>
                                                        </div>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                                            <div className="w-100 xpo_max-w-66 ms-auto">
                                                                <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                                    <div className="progress-bar bg-info-main rounded-pill" style={{width: '30%'}}></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-secondary-light font-xs fw-semibold">30%</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_gap-3">
                                                        <div className="xpo_flex xpo_items-center xpo_w-100">
                                                            <img src="https://flagcdn.com/48x36/us.png" alt="" className="w-40-px xpo_h-40-px rounded-circle xpo_flex-shrink-0 me-12" />
                                                            <div className="xpo_flex-grow-1">
                                                                <h6 className="text-sm xpo_mb-0">USA</h6>
                                                                <span className="text-xs xpo_text-secondary-light fw-medium">1,240 Users</span>
                                                            </div>
                                                        </div>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                                            <div className="w-100 xpo_max-w-66 ms-auto">
                                                                <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                                    <div className="progress-bar bg-primary-600 rounded-pill" style={{width: '80%'}}></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-secondary-light font-xs fw-semibold">80%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xxl-6">
                            <div className="card xpo_h-100">
                                <div className="card-body">
                                    <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-content-between">
                                        <h6 className="mb-2 fw-bold xpo_text-lg xpo_mb-0">Generated Content</h6>
                                        <select className="form-select form-select-sm xpo_w-auto bg-base border xpo_text-secondary-light">
                                            <option>Today</option>
                                            <option>Weekly</option>
                                            <option>Monthly</option>
                                            <option>Yearly</option>
                                        </select>
                                    </div>

                                    <ul className="xpo_flex xpo_flex-wrap xpo_items-center xpo_mt-3 xpo_gap-3">
                                        <li className="xpo_flex xpo_items-center xpo_gap-2">
                                            <span className="w-12-px xpo_h-12-px rounded-circle bg-primary-600"></span>
                                            <span className="text-secondary-light xpo_text-sm fw-semibold">Word: 
                                                <span className="text-primary-light fw-bold">500</span>
                                            </span>
                                        </li>
                                        <li className="xpo_flex xpo_items-center xpo_gap-2">
                                            <span className="w-12-px xpo_h-12-px rounded-circle bg-yellow"></span>
                                            <span className="text-secondary-light xpo_text-sm fw-semibold">Image:  
                                                <span className="text-primary-light fw-bold">300</span>
                                            </span>
                                        </li>
                                    </ul>

                                    <div className="mt-40">
                                        <div id="paymentStatusChart" className="margin-16-minus"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
