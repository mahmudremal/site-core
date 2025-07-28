import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { __ } from '@js/utils';
import { NavMenu, home_route } from '@banglee/core';
import { Play, Pause, Activity, Layers, Settings, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';

const McpDashboard = () => {
  const [addons, setAddons] = useState([]);
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [addonsRes, statusRes, logsRes] = await Promise.all([
        axios.get('/mcp/addons'),
        axios.get('/mcp/status'),
        axios.get('/mcp/logs?limit=10')
      ]);
      
      setAddons(addonsRes.data.addons);
      setStats(statusRes.data.stats);
      setLogs(logsRes.data.logs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = async (addonName) => {
    try {
      await axios.put(`/mcp/addons/${addonName}/toggle`);
      fetchData();
    } catch (error) {
      console.error('Error toggling addon:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'xpo_text-green-600';
      case 'error': return 'xpo_text-red-600';
      default: return 'xpo_text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="xpo_w-4 xpo_h-4 xpo_text-green-600" />;
      case 'error': return <AlertCircle className="xpo_w-4 xpo_h-4 xpo_text-red-600" />;
      default: return <Clock className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-64">
        <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <NavMenu />
      <div className="xpo_p-6 xpo_space-y-6">
        <div>
          <div className="xpo_flex xpo_items-center xpo_justify-between">
            <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{__('MCP Server Dashboard')}</h1>
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <Activity className="xpo_w-5 xpo_h-5 xpo_text-blue-600" />
              <span className="xpo_text-sm xpo_text-gray-600">{__('Server Status: Active')}</span>
            </div>
          </div>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-4 xpo_gap-6">
          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_p-6">
            <div className="xpo_flex xpo_items-center">
              <div className="xpo_p-3 xpo_rounded-full xpo_bg-blue-100">
                <Layers className="xpo_w-6 xpo_h-6 xpo_text-blue-600" />
              </div>
              <div className="xpo_ml-4">
                <p className="xpo_text-sm xpo_font-medium xpo_text-gray-600">{__('Total Addons')}</p>
                <p className="xpo_text-2xl xpo_font-semibold xpo_text-gray-900">{addons.length}</p>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_p-6">
            <div className="xpo_flex xpo_items-center">
              <div className="xpo_p-3 xpo_rounded-full xpo_bg-green-100">
                <CheckCircle className="xpo_w-6 xpo_h-6 xpo_text-green-600" />
              </div>
              <div className="xpo_ml-4">
                <p className="xpo_text-sm xpo_font-medium xpo_text-gray-600">{__('Successful Events')}</p>
                <p className="xpo_text-2xl xpo_font-semibold xpo_text-gray-900">{stats.successful_events || 0}</p>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_p-6">
            <div className="xpo_flex xpo_items-center">
              <div className="xpo_p-3 xpo_rounded-full xpo_bg-red-100">
                <AlertCircle className="xpo_w-6 xpo_h-6 xpo_text-red-600" />
              </div>
              <div className="xpo_ml-4">
                <p className="xpo_text-sm xpo_font-medium xpo_text-gray-600">{__('Failed Events')}</p>
                <p className="xpo_text-2xl xpo_font-semibold xpo_text-gray-900">{stats.failed_events || 0}</p>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_p-6">
            <div className="xpo_flex xpo_items-center">
              <div className="xpo_p-3 xpo_rounded-full xpo_bg-yellow-100">
                <Clock className="xpo_w-6 xpo_h-6 xpo_text-yellow-600" />
              </div>
              <div className="xpo_ml-4">
                <p className="xpo_text-sm xpo_font-medium xpo_text-gray-600">{__('Avg Execution Time')}</p>
                <p className="xpo_text-2xl xpo_font-semibold xpo_text-gray-900">{Math.round(stats.avg_execution_time || 0)}ms</p>
              </div>
            </div>
          </div>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-6">
          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow">
            <div className="xpo_px-6 xpo_py-4 xpo_border-b xpo_border-gray-200">
              <h2 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{__('MCP Addons')}</h2>
            </div>
            <div className="xpo_p-6">
              <div className="xpo_space-y-4">
                {addons.map((addon) => (
                  <div key={addon.id} className="xpo_flex xpo_items-center xpo_justify-between xpo_p-4 xpo_border xpo_rounded-lg">
                    <div className="xpo_flex xpo_items-center xpo_space-x-3">
                      <div className={`xpo_w-3 xpo_h-3 xpo_rounded-full ${addon.enabled ? 'xpo_bg-green-500' : 'xpo_bg-red-500'}`}></div>
                      <div>
                        <p className="xpo_font-medium xpo_text-gray-900">{addon.name}</p>
                        <p className="xpo_text-sm xpo_text-gray-500">{addon.enabled ? __('Active') : __('Inactive')}</p>
                      </div>
                    </div>
                    <div className="xpo_flex xpo_items-center xpo_space-x-2">
                      <Link
                        to={home_route('mcp', `addons/${addon.name}`)}
                        className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600"
                      >
                        <Settings className="xpo_w-4 xpo_h-4" />
                      </Link>
                      <button
                        onClick={() => toggleAddon(addon.name)}
                        className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600"
                      >
                        {addon.enabled ? <Pause className="xpo_w-4 xpo_h-4" /> : <Play className="xpo_w-4 xpo_h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow">
            <div className="xpo_px-6 xpo_py-4 xpo_border-b xpo_border-gray-200">
              <h2 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{__('Recent Activity')}</h2>
            </div>
            <div className="xpo_p-6">
              <div className="xpo_space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="xpo_flex xpo_items-start xpo_space-x-3">
                    {getStatusIcon(log.status)}
                    <div className="xpo_flex-1 xpo_min-w-0">
                      <p className="xpo_text-sm xpo_font-medium xpo_text-gray-900">{log.element_name}</p>
                      <p className="xpo_text-xs xpo_text-gray-500">{log.addon_name} • {log.event_type}</p>
                      <p className="xpo_text-xs xpo_text-gray-400">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded-full ${log.status === 'success' ? 'xpo_bg-green-100 xpo_text-green-800' : 'xpo_bg-red-100 xpo_text-red-800'}`}>
                      {log.execution_time_ms}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default McpDashboard;