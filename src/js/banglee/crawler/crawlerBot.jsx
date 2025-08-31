import { Bot, Send, Search, Wifi, WifiOff, CornerDownLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { NavMenu } from '../core';

export default function CrawlerClient() {
    const [isConnected, setIsConnected] = useState(false);
    const [isCrawling, setIsCrawling] = useState(false);
    const [crawlStatus, setCrawlStatus] = useState([]);
    const [urls, setUrls] = useState('');

    const socketRef = useRef(null);
    
    useEffect(() => {
        socketRef.current = io('http://localhost:3000/bot');

        socketRef.current.on('connect', () => {
            console.log("Connected bot peer")
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log("Disconnected bot peer")
            setIsConnected(false);
        });

        socketRef.current.on('crawl-status', (status) => {
            setIsCrawling(status.isRunning);
        });

        socketRef.current.on('crawling', (data) => {
            setCrawlStatus(prev => [
                { type: 'crawling', url: data.url, timestamp: new Date().toLocaleString() },
                ...prev
            ]);
        });

        socketRef.current.on('crawled', (data) => {
            setCrawlStatus(prev => [
                {type: 'crawled', url: data.url, content: data.content, timestamp: new Date().toLocaleString()},
                ...prev
            ]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }
    }, []);
    

    return (
        <div>
            <NavMenu />
            <div className="xpo_p-4 xpo_flex xpo_flex-col xpo_gap-4">
                <div className="xpo_max-w-4xl xpo_w-full xpo_mx-auto xpo_bg-gray-100 xpo_rounded-lg xpo_p-6">
                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
                        <h1 className="xpo_text-2xl xpo_font-bold xpo_flex xpo_items-center">
                            <Bot className="xpo_mr-2" /> Web Crawler
                        </h1>
                        <div className="xpo_flex xpo_items-center">
                            {isConnected ? (
                                <Wifi className="xpo_text-green-500 xpo_mr-2" />
                            ) : (
                                <WifiOff className="xpo_text-red-500 xpo_mr-2" />
                            )}
                            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>

                    <form className="xpo_mb-4 xpo_flex" onSubmit={(e) => {
                        e.preventDefault();e.stopPropagation();
                        if (urls) {socketRef.current.emit('update-links', { links: urls });setUrls('');}
                    }}>
                        <input 
                            type="text" 
                            value={urls}
                            placeholder="Enter URL to crawl"
                            onChange={(e) => setUrls(e.target.value)}
                            className="xpo_flex-grow xpo_p-2 xpo_border xpo_rounded-l-md xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-blue-500"
                        />
                        <button type="submit" className="xpo_bg-blue-500 xpo_text-white xpo_p-2 xpo_rounded-r-md xpo_hover:bg-blue-600">
                            <Send size={20} />
                        </button>
                    </form>

                    <div className="xpo_flex xpo_space-x-4 xpo_mb-4">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();e.stopPropagation();
                                socketRef.current.emit('start-crawl');
                                setIsCrawling(true);
                            }}
                            disabled={isCrawling}
                            className={`xpo_flex xpo_items-center xpo_p-2 xpo_rounded ${
                                isCrawling 
                                ? 'xpo_bg-gray-400 xpo_cursor-not-allowed' 
                                : 'xpo_bg-green-500 xpo_text-white xpo_hover:bg-green-600'
                            }`}
                        >
                            <Search className="xpo_mr-2" /> Start Crawling
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();e.stopPropagation();
                                socketRef.current.emit('stop-crawl');setIsCrawling(false);
                            }}
                            disabled={!isCrawling}
                            className={`xpo_flex xpo_items-center xpo_p-2 xpo_rounded ${
                                !isCrawling 
                                ? 'xpo_bg-gray-400 xpo_cursor-not-allowed' 
                                : 'xpo_bg-red-500 xpo_text-white xpo_hover:bg-red-600'
                            }`}
                        >
                            <CornerDownLeft className="xpo_mr-2" /> Stop Crawling
                        </button>
                    </div>
                </div>
                <div className="xpo_rounded-lg xpo_p-6">
                    <div className="xpo_mt-6">
                        <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4">Crawl Status</h2>
                        <div className="xpo_max-h-64 xpo_overflow-y-auto xpo_border xpo_rounded">
                            {crawlStatus.map((status, index) => (
                                <div 
                                    key={index} 
                                    className={`xpo_p-3 xpo_border-b xpo_flex xpo_justify-between ${
                                        status.type === 'crawling' 
                                        ? 'xpo_bg-yellow-50' 
                                        : 'xpo_bg-green-50'
                                    }`}
                                >
                                    <div>
                                        <span className="xpo_font-bold">{status.type.toUpperCase()}: </span>
                                        <span>{status.url}</span>
                                    </div>
                                    <span className="xpo_text-gray-500 xpo_text-sm">{status.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
