import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { __ } from '@js/utils';
import { NavMenu, home_route } from '@banglee/core';
import { ArrowLeft, Play, Pause, PenTool, Database, FileText, CheckCircle, AlertCircle, Activity, TestTube } from 'lucide-react';

const McpAddonDetail = () => {
  const { addon: addonName } = useParams();
  const [addon, setAddon] = useState(null);
  const [elements, setElements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [addonName]);

  const fetchData = async () => {
    try {
      const [addonsRes, elementsRes, logsRes] = await Promise.all([
        axios.get('/mcp/addons'),
        axios.get('/mcp/elements'),
        axios.get(`/mcp/logs?addon_name=${addonName}&limit=20`)
      ]);

      const currentAddon = addonsRes.data.addons.find(a => a.name === addonName);
      const addonElements = elementsRes.data.elements.filter(e => e.addon_name === addonName);

      setAddon(currentAddon);
      setElements(addonElements);
      setLogs(logsRes.data.logs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleElement = async (elementId) => {
    try {
      await axios.put(`/mcp/elements/${elementId}/toggle`);
      fetchData();
    } catch (error) {
      console.error('Error toggling element:', error);
    }
  };

  const testTool = async (toolName) => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await axios.post('/mcp/test-tool', {
        tool_name: toolName,
        arguments: {}
      });
      setTestResult({ success: true, data: response.data });
    } catch (error) {
      setTestResult({ success: false, error: error.response?.data?.error || error.message });
    } finally {
      setTestLoading(false);
    }
  };

  const getElementIcon = (type) => {
    switch (type) {
      case 'tool': return <PenTool className="xpo_w-4 xpo_h-4 xpo_text-blue-600" />;
      case 'resource': return <Database className="xpo_w-4 xpo_h-4 xpo_text-green-600" />;
      case 'prompt': return <FileText className="xpo_w-4 xpo_h-4 xpo_text-purple-600" />;
      default: return <Activity className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />;
    }
  };

  const getElementColor = (type) => {
    switch (type) {
      case 'tool': return 'xpo_bg-blue-100 xpo_text-blue-800';
      case 'resource': return 'xpo_bg-green-100 xpo_text-green-800';
      case 'prompt': return 'xpo_bg-purple-100 xpo_text-purple-800';
      default: return 'xpo_bg-gray-100 xpo_text-gray-800';
    }
  };

  const groupedElements = elements.reduce((acc, element) => {
    if (!acc[element.element_type]) {
      acc[element.element_type] = [];
    }
    acc[element.element_type].push(element);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-64">
        <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-600"></div>
      </div>
    );
  }

  if (!addon) {
    return (
      <div className="xpo_p-6">
        <div className="xpo_text-center">
          <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{__('Addon not found')}</h1>
          <Link to={home_route('mcp', '')} className="xpo_mt-4 xpo_text-blue-600 hover:xpo_text-blue-800">
            {__('Back to Dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_p-6 xpo_space-y-6">
      <div className="xpo_flex xpo_items-center xpo_justify-between">
        <div className="xpo_flex xpo_items-center xpo_space-x-4">
          <Link to={home_route('mcp', '')} className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600">
            <ArrowLeft className="xpo_w-5 xpo_h-5" />
          </Link>
          <div>
            <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{addon.name}</h1>
            <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mt-1">
              <div className={`xpo_w-3 xpo_h-3 xpo_rounded-full ${addon.enabled ? 'xpo_bg-green-500' : 'xpo_bg-red-500'}`}></div>
              <span className="xpo_text-sm xpo_text-gray-600">{addon.enabled ? __('Active') : __('Inactive')}</span>
            </div>
          </div>
        </div>
        <div className="xpo_flex xpo_items-center xpo_space-x-2">
          <span className="xpo_text-sm xpo_text-gray-500">{__('Last updated')}: {new Date(addon.updated_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_gap-6">
        <div className="lg:xpo_col-span-2 xpo_space-y-6">
          {Object.entries(groupedElements).map(([type, items]) => (
            <div key={type} className="xpo_bg-white xpo_rounded-lg xpo_shadow">
              <div className="xpo_px-6 xpo_py-4 xpo_border-b xpo_border-gray-200">
                <div className="xpo_flex xpo_items-center xpo_space-x-2">
                  {getElementIcon(type)}
                  <h2 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_capitalize">{__(type + 's')}</h2>
                  <span className="xpo_text-sm xpo_text-gray-500">({items.length})</span>
                </div>
              </div>
              <div className="xpo_p-6">
                <div className="xpo_space-y-4">
                  {items.map((element) => (
                    <div key={element.id} className="xpo_flex xpo_items-center xpo_justify-between xpo_p-4 xpo_border xpo_rounded-lg">
                      <div className="xpo_flex xpo_items-center xpo_space-x-3">
                        <div className={`xpo_w-3 xpo_h-3 xpo_rounded-full ${element.enabled ? 'xpo_bg-green-500' : 'xpo_bg-red-500'}`}></div>
                        <div>
                          <p className="xpo_font-medium xpo_text-gray-900">{element.element_name}</p>
                          <span className={`xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded-full ${getElementColor(element.element_type)}`}>
                            {element.element_type}
                          </span>
                        </div>
                      </div>
                      <div className="xpo_flex xpo_items-center xpo_space-x-2">
                        {element.element_type === 'tool' && (
                          <button
                            onClick={() => testTool(element.element_name)}
                            disabled={testLoading || !element.enabled}
                            className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600 xpo_disabled:opacity-50"
                          >
                            <TestTube className="xpo_w-4 xpo_h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleElement(element.id)}
                          className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600"
                        >
                          {element.enabled ? <Pause className="xpo_w-4 xpo_h-4" /> : <Play className="xpo_w-4 xpo_h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {testResult && (
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow">
              <div className="xpo_px-6 xpo_py-4 xpo_border-b xpo_border-gray-200">
                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{__('Test Result')}</h3>
              </div>
              <div className="xpo_p-6">
                <div className={`xpo_p-4 xpo_rounded-lg ${testResult.success ? 'xpo_bg-green-50 xpo_border xpo_border-green-200' : 'xpo_bg-red-50 xpo_border xpo_border-red-200'}`}>
                  <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mb-2">
                    {testResult.success ? (
                      <CheckCircle className="xpo_w-5 xpo_h-5 xpo_text-green-600" />
                    ) : (
                      <AlertCircle className="xpo_w-5 xpo_h-5 xpo_text-red-600" />
                    )}
                    <span className={`xpo_font-medium ${testResult.success ? 'xpo_text-green-800' : 'xpo_text-red-800'}`}>
                      {testResult.success ? __('Success') : __('Error')}
                    </span>
                  </div>
                  <pre className="xpo_text-sm xpo_text-gray-700 xpo_whitespace-pre-wrap">
                    {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="xpo_bg-white xpo_rounded-lg xpo_shadow">
          <div className="xpo_px-6 xpo_py-4 xpo_border-b xpo_border-gray-200">
            <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{__('Activity Log')}</h3>
          </div>
          <div className="xpo_p-6">
            <div className="xpo_space-y-4 xpo_max-h-96 xpo_overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="xpo_flex xpo_items-start xpo_space-x-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="xpo_w-4 xpo_h-4 xpo_text-green-600 xpo_mt-0.5" />
                  ) : (
                    <AlertCircle className="xpo_w-4 xpo_h-4 xpo_text-red-600 xpo_mt-0.5" />
                  )}
                  <div className="xpo_flex-1 xpo_min-w-0">
                    <p className="xpo_text-sm xpo_font-medium xpo_text-gray-900">{log.element_name}</p>
                    <p className="xpo_text-xs xpo_text-gray-500">{log.event_type}</p>
                    <p className="xpo_text-xs xpo_text-gray-400">{new Date(log.created_at).toLocaleString()}</p>
                    {log.error_message && (
                      <p className="xpo_text-xs xpo_text-red-600 xpo_mt-1">{log.error_message}</p>
                    )}
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
  );
};

export default McpAddonDetail;