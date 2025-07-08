import io from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import { Chart, LineController, LinearScale, Title, ArcElement, LineElement, PointElement } from 'chart.js';
import { __ } from '@js/utils';
import { X } from 'lucide-react';

// Register required Chart.js components
Chart.register(LinearScale, LineController, Title, ArcElement, LineElement, PointElement);

const ECGChart = React.memo(({ canvasId, data }) => {
    const ctxRef = useRef(null);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        ctxRef.current = ctx;
        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'ECG Signal',
                    data: [],
                    borderColor: '#4caf50',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Time (s)' },
                    },
                    y: {
                        title: { display: true, text: 'Amplitude (mV)' },
                    },
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                },
            },
        });
        setChart(newChart);

        return () => {
            newChart.destroy(); // Handle cleanup by destroying the chart instance
        };
    }, [canvasId]);

    // Listen for new data and update the chart
    useEffect(() => {
        if (chart && data) {
            chart.data.labels.push(data.time.toFixed(2));
            chart.data.datasets[0].data.push(data.amplitude);
            if (chart.data.labels.length > 50) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.update();
        }
    }, [data, chart]);

    return null;
});

export default function HealthsHome() {
    const [showTable, setShowTable] = useState(true);
    const [chartVisible, setChartVisible] = useState(false);
    const [streamType, setStreamType] = useState('');
    const [users, setUsers] = useState([]);
    const [logged, setLogged] = useState(null);
    const [toast, setToast] = useState(null);

    const socketRef = useRef(io('http://localhost:3000')); 
    const healthChartRef = useRef(null);
    const userTableBodyRef = useRef([]);

    const streamTypes = [
        ['blood_pressure', 'Blood Pressure', '#FF6B6B'],
        ['body_heat', 'Body Temperature', '#60A5FA'],
        ['heart_rate', 'Heart Rate', '#FFB74D'],   
        ['sugar_level', 'Sugar Level', '#FBBF24'],  
        ['sleep_record', 'Sleep Record', '#4CAF50'], 
        ['activity_record', 'Activity Record', '#9C27B0']
    ];

    useEffect(() => {
        fetchUsers();

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const fetchUsers = async () => {
        fetch('/health/users')
        .then(res => res.json())
        .then(list => setUsers(list))
        .catch(err => console.error("Failed to fetch users:", err));
    };

    const handleToggleTable = () => {
        setShowTable((prev) => !prev);
    };

    const handleLaunchChart = () => {
        setChartVisible(true);
        const ctx = healthChartRef.current.getContext('2d');

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [], // To be filled with real data
                datasets: [{
                    data: [], // To be filled with real data
                    backgroundColor: streamTypes.map(([, , color]) => color),
                }],
            },
            options: { responsive: true, animation: false },
        });
        socketRef.current.emit('s2c_stream', { stream_type: 'health_insights' });
    };

    const handleStartStream = () => {
        if (streamType) {
            socketRef.current.emit('start_connection', { deviceType: streamType });

            // const ecgChart = new ECGChart({ canvasId: 'streamLive' });  // <== Remove this line

            const intervalId = setInterval(() => {
                const dummyData = generateDummyData(streamType);
                // ecgChart.addDataPoint(dummyData.value);
                socketRef.current.emit('device_stream', dummyData);
            }, 2000);

            return () => clearInterval(intervalId);
        }
    };

    const generateDummyData = (streamType) => {
        let value;
        switch(streamType) {
            case 'blood_pressure':
                value = 120 + (Math.random() - 0.5) * 8;
                break;
            case 'body_heat':
                value = 36.8 + (Math.random() - 0.5) * 0.3;
                break;
            case 'sugar_level':
                value = 90 + (Math.random() - 0.5) * 15;
                break;
            case 'sleep_record':
                value = 7 + (Math.random() - 0.5) * 0.8;
                break;
            default:
                value = 0;
        }
        return { record_type: streamType, value: parseFloat(value.toFixed(2)) };
    };

    const handleCreateUser = async () => {
        // User creation logic and update table
    };
    useEffect(() => {
      if (!toast) return;
      if (toast?.time == false) return;
      const timed = setTimeout(() => {
        setToast(null);
      }, toast?.time??4000);
      
      return () => {
        clearTimeout(timed);
      }
    }, [toast]);

    return (
        <div className="xpo_bg-gray-100 xpo_text-gray-900">
            {toast ? (
                <div className="xpo_fixed xpo_bottom-4 xpo_right-4 xpo_bg-gray-800 xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_shadow-lg xpo_flex xpo_items-center xpo_space-x-4 xpo_z-50">
                    <p className="xpo_text-base">{toast?.message??toast}</p>
                    <button
                        onClick={e => setToast(null)}
                        className="xpo_p-1 xpo_rounded-full hover:xpo_bg-gray-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-gray-600"
                        aria-label="Close"
                    >
                        <X className="xpo_h-5 xpo_w-5 xpo_text-white" />
                    </button>
                </div>
            ) : null}
            <div className="xpo_container xpo_mx-auto xpo_p-4">
                <h1 className="xpo_text-4xl xpo_font-extrabold xpo_text-center xpo_mb-6">Health Monitoring Client</h1>
                <div className="xpo_mb-8">
                    <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-4">
                        {showTable ? <h2 className="xpo_text-3xl xpo_font-semibold">User Management</h2> : null}
                        <button 
                            onClick={handleToggleTable} 
                            className={`xpo_bg-blue-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded xpo_shadow-lg`}
                        >
                            {showTable ? 'Hide Users' : 'Show Users'}
                        </button>
                    </div>
                    {showTable && (
                        <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_p-6">
                            <table className="xpo_min-w-full xpo_border-collapse xpo_rounded-lg overflow-hidden">
                                <thead>
                                    <tr>
                                        <th className="xpo_border xpo_p-3">First Name</th>
                                        <th className="xpo_border xpo_p-3">Last Name</th>
                                        <th className="xpo_border xpo_p-3">Email</th>
                                        <th className="xpo_border xpo_p-3">Phone</th>
                                        <th className="xpo_border xpo_p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody ref={userTableBodyRef}>
                                    {users.map((user, index) => (
                                        <tr key={index}>
                                            <td className="xpo_border xpo_p-3">{user.id != 0 ? user.fn : <input type="text" value={user.fn} onChange={e => setUsers(prev => prev.map((u, i) => u.id == user.id ? {...u, fn: e.target.value} : u))} />}</td>
                                            <td className="xpo_border xpo_p-3">{user.id != 0 ? user.ln : <input type="text" value={user.ln} onChange={e => setUsers(prev => prev.map((u, i) => u.id == user.id ? {...u, ln: e.target.value} : u))} />}</td>
                                            <td className="xpo_border xpo_p-3">{user.id != 0 ? user.e : <input type="text" value={user.e} onChange={e => setUsers(prev => prev.map((u, i) => u.id == user.id ? {...u, e: e.target.value} : u))} />}</td>
                                            <td className="xpo_border xpo_p-3">{user.id != 0 ? user.p : <input type="text" value={user.p} onChange={e => setUsers(prev => prev.map((u, i) => u.id == user.id ? {...u, p: e.target.value} : u))} />}</td>
                                            <td className="xpo_border xpo_p-3">
                                                <button
                                                    onClick={e => 
                                                        fetch('/health/login', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ e: user.e })
                                                        }).then(r => r.json()).then(data => {
                                                            if(data.token) {
                                                                socketRef.current.emit('authenticate', data.token);
                                                                setToast({message: 'Logged in as ' + user.e, type: 'success'});
                                                            } else {
                                                                setToast({message: 'Authentication failed', type: 'error'});
                                                            }
                                                        })
                                                    }
                                                    className={`xpo_text-white xpo_px-3 xpo_py-1 xpo_rounded ${user.id == 0 ? 'xpo_bg-blue-600' : 'xpo_bg-red-600'}`}
                                                >{user.id == 0 ? __('Register') : __('Login')}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={(e) => setUsers(prev => ([...prev, {id: 0}]))} className="xpo_mt-6 xpo_bg-green-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded shadow-lg">Create New User</button>
                        </div>
                    )}
                </div>
                {chartVisible && (
                    <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_p-6 mb-8">
                        <canvas ref={healthChartRef} id="healthChart"></canvas>
                        <button onClick={() => setChartVisible(false)} className="xpo_mt-6 xpo_bg-red-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded shadow-lg">Close Chart</button>
                    </div>
                )}
                <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_p-6">
                    <h2 className="xpo_text-3xl xpo_font-semibold mb-6">Device Stream</h2>
                    <div className="xpo_flex xpo_items-center xpo_space-x-6 mb-6">
                        <label htmlFor="streamType" className="xpo_font-medium xpo_text-lg">Select Data Stream Type:</label>
                        <select 
                            id="streamType"
                            value={streamType}
                            onChange={(e) => setStreamType(e.target.value)}
                            className="xpo_border xpo_rounded-lg xpo_p-3"
                        >
                            <option value="">Select a stream type</option>
                            {streamTypes.map(([key, level]) => (
                                <option key={key} value={key}>{level}</option>
                            ))}
                        </select>
                        <button onClick={handleStartStream} className="xpo_bg-blue-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded shadow-lg">Start Stream</button>
                    </div>
                    <div className="xpo_bg-white xpo_p-4">
                        <canvas id="streamLive" style={{ maxHeight: '200px', width: '100%' }}></canvas>
                    </div>
                    <button onClick={handleLaunchChart} className="xpo_bg-purple-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded shadow-lg">Launch Insights</button>
                </div>
                <ECGChart canvasId="streamLive" />
            </div>
        </div>
    );
};