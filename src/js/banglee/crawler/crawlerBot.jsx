import { Bot, Send, Search, Wifi, WifiOff, CornerDownLeft, Import, Power, Activity, CheckCircle, Clock, AlertCircle, CircleX, Eye } from 'lucide-react';
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { io } from 'socket.io-client';
import { NavMenu } from '../core';
import { __, Popup } from '@js/utils';
const Pre = lazy(() => import('./Pre'));




const MAX_CRAWL_STATUS_ITEMS = 500;

export default function CrawlerClient() {
    const [isConnected, setIsConnected] = useState(false);
    const [isImporting, setIsImporting] = useState(true);
    const [isCrawling, setIsCrawling] = useState(true);
    const [crawlStatus, setCrawlStatus] = useState([]);
    const [imports, setImports] = useState([]);
    const [popup, setPopup] = useState(null);
    const [urls, setUrls] = useState('');
    const [totals, setTotals] = useState({
        totalPending: 0, totalCrawled: 0, totalImported: 0
    });

    const socketRef = useRef(null);
    
    useEffect(() => {
        socketRef.current = io('http://localhost:3000/bot');

        socketRef.current.on('connect', () => {
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        socketRef.current.on('crawl-status', (status) => {
            setIsCrawling(status.isRunning);
            if (!status?.totalPending && !status?.totalCrawled) return;
            const { totalPending = null, totalCrawled = null, totalImported = null } = status;
            console.log(status)
            setTotals(prev => ({
                totalPending: totalPending || prev.totalPending, totalCrawled: totalCrawled || prev.totalCrawled, totalImported: totalImported || prev.totalImported
            }));
        });

        socketRef.current.on('import-status', (status) => {
            setIsImporting(status.importing);
        });

        socketRef.current.on('crawling', (data) => {
            console.log('crawling', data)
            setCrawlStatus(prev => {
                const newItem = {
                    ...data,
                    type: 'crawling', 
                    url: data.url, 
                    timestamp: new Date().toLocaleString()
                };
                const updated = [newItem, ...prev];
                return updated.slice(0, MAX_CRAWL_STATUS_ITEMS);
            });
        });

        socketRef.current.on('crawled', (data) => {
            console.log('crawled', data)
            setCrawlStatus(prev => prev.map(i => i.id == data.id ? {...data} : i));
        });

        socketRef.current.on('imported', (list) => {
            setImports(prev => [...list, ...prev]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }
    }, []);

    const getStatusIcon = (status) => {
        if (status.state == 'loading') {
            return <Activity className="xpo_w-4 xpo_h-4 xpo_text-blue-500 xpo_animate-spin" />;
        }
        if (status.state == 'success') {
            return <CheckCircle className="xpo_w-4 xpo_h-4 xpo_text-green-500" />;
        }
        return <CircleX className="xpo_w-4 xpo_h-4 xpo_text-green-500" />;
    };

    const getStatusColor = (status) => {
        if (status.state == 'loading') {
            return 'xpo_border-l-blue-500 xpo_bg-blue-50';
        }
        if (status.state == 'success') {
            return 'xpo_border-l-green-500 xpo_bg-green-50';
        }
        return 'xpo_border-l-red-500 xpo_bg-red-50';
    };

    const crawledCount = crawlStatus.filter(s => s.state != 'loading').length;
    const crawlingCount = crawlStatus.filter(s => s.state == 'loading').length;
    
    return (
        <div className="xpo_min-h-screen xpo_bg-gray-50">
            <NavMenu />
            <div className="xpo_container xpo_mx-auto xpo_px-4 xpo_py-8 xpo_max-w-7xl">
                {/* Header Card */}
                <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_border xpo_border-gray-200 xpo_p-8 xpo_mb-8">
                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-8">
                        <div className="xpo_flex xpo_items-center">
                            <div className="xpo_bg-gradient-to-r xpo_from-blue-500 xpo_to-purple-600 xpo_p-3 xpo_rounded-xl xpo_mr-4">
                                <Bot className="xpo_w-8 xpo_h-8 xpo_text-white" />
                            </div>
                            <div>
                                <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900">
                                    {__('Banglee Crawler', 'site-core')}
                                </h1>
                                <p className="xpo_text-gray-600 xpo_mt-1">
                                    {__('Monitor and manage web crawling operations', 'site-core')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="xpo_flex xpo_items-center xpo_bg-gray-50 xpo_px-4 xpo_py-3 xpo_rounded-xl">
                            {isConnected ? (
                                <>
                                    <div className="xpo_w-3 xpo_h-3 xpo_bg-green-500 xpo_rounded-full xpo_mr-3 xpo_animate-pulse"></div>
                                    <Wifi className="xpo_text-green-600 xpo_mr-2 xpo_w-5 xpo_h-5" />
                                    <span className="xpo_text-green-700 xpo_font-medium">
                                        {__('Connected', 'site-core')}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="xpo_w-3 xpo_h-3 xpo_bg-red-500 xpo_rounded-full xpo_mr-3"></div>
                                    <WifiOff className="xpo_text-red-600 xpo_mr-2 xpo_w-5 xpo_h-5" />
                                    <span className="xpo_text-red-700 xpo_font-medium">
                                        {__('Disconnected', 'site-core')}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-3 xpo_gap-6 xpo_mb-8">
                        <div className="xpo_bg-gradient-to-r xpo_from-blue-50 xpo_to-blue-100 xpo_p-6 xpo_rounded-xl xpo_border xpo_border-blue-200">
                            <div className="xpo_flex xpo_items-center xpo_justify-between">
                                <div>
                                    <p className="xpo_text-blue-600 xpo_text-sm xpo_font-medium">{__('Currently Crawling', 'site-core')}</p>
                                    <p className="xpo_text-3xl xpo_font-bold xpo_text-blue-900">{crawlingCount}</p>
                                </div>
                                <Clock className="xpo_w-8 xpo_h-8 xpo_text-blue-500" />
                            </div>
                        </div>
                        
                        <div className="xpo_bg-gradient-to-r xpo_from-green-50 xpo_to-green-100 xpo_p-6 xpo_rounded-xl xpo_border xpo_border-green-200">
                            <div className="xpo_flex xpo_items-center xpo_justify-between">
                                <div>
                                    <p className="xpo_text-green-600 xpo_text-sm xpo_font-medium">{__('Completed', 'site-core')}</p>
                                    <p className="xpo_text-3xl xpo_font-bold xpo_text-green-900">{totals.totalCrawled + crawledCount}</p>
                                </div>
                                <CheckCircle className="xpo_w-8 xpo_h-8 xpo_text-green-500" />
                            </div>
                        </div>
                        
                        <div className="xpo_bg-gradient-to-r xpo_from-purple-50 xpo_to-purple-100 xpo_p-6 xpo_rounded-xl xpo_border xpo_border-purple-200">
                            <div className="xpo_flex xpo_items-center xpo_justify-between">
                                <div>
                                    <p className="xpo_text-purple-600 xpo_text-sm xpo_font-medium">{__('Total Items', 'site-core')}</p>
                                    <p className="xpo_text-3xl xpo_font-bold xpo_text-purple-900">{totals.totalPending + totals.totalCrawled}</p>
                                </div>
                                <Activity className="xpo_w-8 xpo_h-8 xpo_text-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* URL Input */}
                    <div className="xpo_mb-6">
                        <label className="xpo_block xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-3">
                            {__('Add URL to Crawl', 'site-core')}
                        </label>
                        <form className="xpo_flex xpo_gap-3" onSubmit={(e) => {
                            e.preventDefault();e.stopPropagation();
                            if (urls) {socketRef.current.emit('update-links', { links: urls });setUrls('');}
                        }}>
                            <input 
                                type="text" 
                                value={urls}
                                onChange={(e) => setUrls(e.target.value)}
                                placeholder={__('https://example.com', 'site-core')}
                                className="xpo_flex-grow xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                            />
                            <button 
                                type="submit" 
                                className="xpo_bg-gradient-to-r xpo_from-blue-500 xpo_to-blue-600 xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-xl hover:xpo_from-blue-600 hover:xpo_to-blue-700 xpo_transition-all xpo_flex xpo_items-center xpo_gap-2 xpo_font-medium"
                            >
                                <Send className="xpo_w-4 xpo_h-4" />
                                {__('Add URL', 'site-core')}
                            </button>
                        </form>
                    </div>

                    {/* Control Buttons */}
                    <div className="xpo_flex xpo_flex-wrap xpo_gap-4">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();e.stopPropagation();
                                socketRef.current.emit('start-crawl');
                                setIsCrawling(true);
                            }}
                            disabled={isCrawling}
                            className={`xpo_flex xpo_items-center xpo_gap-3 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium xpo_transition-all ${
                                isCrawling 
                                ? 'xpo_bg-gray-200 xpo_text-gray-500 xpo_cursor-not-allowed' 
                                : 'xpo_bg-gradient-to-r xpo_from-green-500 xpo_to-green-600 xpo_text-white hover:xpo_from-green-600 hover:xpo_to-green-700 xpo_shadow-lg hover:xpo_shadow-xl'
                            }`}
                        >
                            <Search className="xpo_w-5 xpo_h-5" />
                            {__('Start Crawling', 'site-core')}
                        </button>
                        
                        <button 
                            onClick={(e) => {
                                e.preventDefault();e.stopPropagation();
                                socketRef.current.emit('stop-crawl');setIsCrawling(false);
                            }}
                            disabled={!isCrawling}
                            className={`xpo_flex xpo_items-center xpo_gap-3 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium xpo_transition-all ${
                                !isCrawling 
                                ? 'xpo_bg-gray-200 xpo_text-gray-500 xpo_cursor-not-allowed' 
                                : 'xpo_bg-gradient-to-r xpo_from-red-500 xpo_to-red-600 xpo_text-white hover:xpo_from-red-600 hover:xpo_to-red-700 xpo_shadow-lg hover:xpo_shadow-xl'
                            }`}
                        >
                            <CornerDownLeft className="xpo_w-5 xpo_h-5" />
                            {__('Stop Crawling', 'site-core')}
                        </button>
                        
                        <button 
                            onClick={(e) => {
                                e.preventDefault();e.stopPropagation();
                                if (isImporting) {
                                    socketRef.current.emit('stop-imports');
                                } else {
                                    socketRef.current.emit('start-imports');
                                }
                            }}
                            className={`xpo_flex xpo_items-center xpo_gap-3 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium xpo_transition-all xpo_shadow-lg hover:xpo_shadow-xl ${
                                isImporting 
                                ? 'xpo_bg-gradient-to-r xpo_from-red-500 xpo_to-red-600 xpo_text-white hover:xpo_from-red-600 hover:xpo_to-red-700' 
                                : 'xpo_bg-gradient-to-r xpo_from-indigo-500 xpo_to-indigo-600 xpo_text-white hover:xpo_from-indigo-600 hover:xpo_to-indigo-700'
                            }`}
                        >
                            {isImporting ? <Power className="xpo_w-5 xpo_h-5" /> : <Import className="xpo_w-5 xpo_h-5" />}
                            {isImporting ? __('Stop Processing', 'site-core') : __('Process Products', 'site-core')}
                        </button>
                    </div>
                </div>

                {/* Crawl Status Card */}
                <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_border xpo_border-gray-200 xpo_p-8">
                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
                        <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_flex xpo_items-center">
                            <Activity className="xpo_w-6 xpo_h-6 xpo_mr-3 xpo_text-blue-500" />
                            {__('Crawl Status', 'site-core')}
                        </h2>
                        {crawlStatus.length >= MAX_CRAWL_STATUS_ITEMS && (
                            <div className="xpo_flex xpo_items-center xpo_bg-yellow-100 xpo_text-yellow-800 xpo_px-3 xpo_py-2 xpo_rounded-lg">
                                <AlertCircle className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                                <span className="xpo_text-sm xpo_font-medium">
                                    {__('Showing latest 500 items', 'site-core')}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="xpo_max-h-96 xpo_overflow-y-auto xpo_space-y-3">
                        {crawlStatus.length === 0 ? (
                            <div className="xpo_text-center xpo_py-12 xpo_text-gray-500">
                                <Bot className="xpo_w-16 xpo_h-16 xpo_mx-auto xpo_mb-4 xpo_text-gray-300" />
                                <p className="xpo_text-lg xpo_font-medium">{__('No crawling activity yet', 'site-core')}</p>
                                <p className="xpo_text-sm">{__('Add URLs and start crawling to see status updates', 'site-core')}</p>
                            </div>
                        ) : (
                            crawlStatus.map((status, index) => (
                                <div key={index} className={`xpo_border-l-4 xpo_p-4 xpo_rounded-r-xl xpo_border xpo_border-gray-200 xpo_transition-all hover:xpo_shadow-md ${getStatusColor(status)}`}>
                                    <div className="xpo_flex xpo_items-start xpo_justify-between">
                                        <div className="xpo_flex xpo_items-start xpo_gap-3 xpo_flex-1">
                                            {getStatusIcon(status)}
                                            <div className="xpo_flex-1 xpo_min-w-0">
                                                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-2">
                                                    <span className={`xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-semibold ${
                                                        status.state == 'loading'
                                                        ? 'xpo_bg-blue-200 xpo_text-blue-800' 
                                                        : status.state == 'success' ? 'xpo_bg-green-200 xpo_text-green-800' : 'xpo_bg-red-200 xpo_text-red-800'
                                                    }`}>
                                                        {status.state == 'loading' ? __('CRAWLING', 'site-core') : (
                                                            status.state == 'success' ? __('COMPLETED', 'site-core') : __('Failed', 'site-core')
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="xpo_text-gray-900 xpo_font-medium xpo_break-all">
                                                    <a href={status.url} target="_blank">{status?.title??status.url}</a>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="xpo_text-right xpo_flex-shrink-0 xpo_ml-4">
                                            <span className="xpo_text-gray-500 xpo_text-sm xpo_font-medium">
                                                {status.timestamp}
                                            </span>
                                            {status?.content && (
                                                <Eye
                                                    className="xpo_cursor-pointer"
                                                    onClick={() => setPopup(
                                                        <div className="xpo_container xpo_max-h-[90vh] xpo_overflow-auto xpo_p-3">
                                                            <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                                                                <Pre>{JSON.stringify(status.content, null, 2)}</Pre>
                                                            </Suspense>
                                                        </div>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {popup && (<Popup onClose={() => setPopup(null)}>{popup}</Popup>)}
        </div>
    );
}