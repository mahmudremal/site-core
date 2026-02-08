import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Loader,
  Save,
  SquarePen,
  Store,
  Trash2,
  X,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  RefreshCw,
  MoreVertical,
  Archive,
  Copy,
  ExternalLink,
  Bot
} from "lucide-react";
import { Popup, __ } from '@js/utils';
import { home_url, rest_url, notify, sleep, strtotime } from '@functions';
import { sprintf } from 'sprintf-js';
import AIAgentPanel from './AIAgentPanel';


export default function TaskApplication({ config = {} }) {
  const taskTypeLabels = {
    plugin_activation_review: __('Plugin Review', 'site-core'),
    seo_improvements: __('SEO Optimization', 'site-core'),
    new_user_onboarding: __('User Onboarding', 'site-core'),
    media_seo: __('Media SEO', 'site-core'),
    content_review: __('Content Review', 'site-core'),
    bug_fix: __('Bug Fix', 'site-core'),
    post_seo: __('Content SEO', 'site-core'),
    comment_moderation: __('Comments Moderation', 'site-core'),
    order_processing: __('Order Processing', 'site-core'),
    payment_completed: __('Payment Completed', 'site-core'),
    order_status_update: __('Order Status Update', 'site-core'),
    theme_switch_review: __('Theme Switch', 'site-core'),
    plugin_activation_review: __('Plugin Activation Review', 'site-core'),
    elem_form: __('Elementor Form Entry', 'site-core'),
    metform_submit: __('Metform Form Entry', 'site-core'),
  };

  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    in_progress: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Play,
      label: 'In Progress'
    },
    completed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Completed'
    },
    paused: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Pause,
      label: 'Paused'
    },
    failed: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertCircle,
      label: 'Failed'
    }
  };

  const hashed = window.location.hash.slice(1).split(',');

  const [statuses] = useState(config?.statuses || Object.keys(statusConfig));
  const [taskTypes] = useState(config?.task_types || Object.keys(taskTypeLabels));
  const [pagination, setPagination] = useState({ total: 47, totalPages: 3 });
  const [tableItems, setTableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    search: hashed[1] ?? '',
    per_page: 20,
    status: hashed[2] ?? 'pending',
    task_type: taskTypeLabels?.[hashed[0]] ? hashed[0] : 'any',
    priority: hashed[3] ?? 'any',
    orderby: hashed[4] ?? 'id',
    order: hashed[5] ?? 'desc'
  });
  const [insights, setInsights] = useState({});

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-green-50 text-green-700 border-green-200'
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      axios.get(`https://${location.host}/wp-json/sitecore/v1/tasks`, {
        params: { ...filters },
        headers: {
          'Content-Type': 'application/json',
          // 'X-WP-Nonce': config?._nonce
        },
        // withCredentials: true
      })
        .then(res => {
          setPagination(prev => ({ ...prev, total: parseInt(res.headers.get('x-wp-total')), totalPages: parseInt(res.headers.get('x-wp-totalpages')) }));
          setTableItems(res.data.map(i => ({ ...i, task_object: JSON.stringify(i.task_object) })));
        })
        .catch(err => {
          notify.error(err?.response?.data?.message ?? err?.message ?? __('Something went wrong!', 'site-core'), { position: 'bottom-right' })
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      axios.get(`https://${location.host}/wp-json/sitecore/v1/tasks/insights`, {
        params: { status: filters.status, search: filters.search },
        headers: {
          'Content-Type': 'application/json',
          // 'X-WP-Nonce': config?._nonce
        },
        // withCredentials: true
      })
        .then(res => res.data)
        .then(res => setInsights(res.reduce((p, i) => ({ ...p, [i.task_type]: Number(i.total) }), {})))
        .catch(err => notify.error(err?.response?.data?.message ?? err?.message ?? __('Something went wrong!', 'site-core'), { position: 'bottom-right' }))
    }, 1500);

    return () => clearTimeout(handler);
  }, [filters.status, filters.search]);

  const handleBulkAction = async (action) => {
    if (selectedTasks.length === 0) return;
    // Handle bulk actions
    console.log(`Bulk ${action} for tasks:`, selectedTasks);
    // 
    for (const task_id of selectedTasks.map(Number)) {
      switch (action) {
        case 'delete':
          setTableItems(prev => prev.map(i => i.id == task_id ? { ...i, deleting: true } : i));
          await axios.delete(`https://${location.host}/wp-json/sitecore/v1/tasks/${task_id}`)
            .then(async () => await sleep(2000))
            .then(() => notify.success(sprintf(__('Task %s deleted successfully!', 'site-core'), task_id)))
            .then(() =>
              setTableItems(prev => prev.map(i => i.id == task_id ? { ...i, deleted: true } : i))
            )
            // .then(() => setInsights(prev => ({...prev, [tableItems.find(i => i.id == task_id)?.task_type]: prev?.[tableItems.find(i => i.id == task_id)?.task_type]??1 - 1})))
            .catch(err => {
              setTableItems(prev => prev.map(i => i.id == task_id ? { ...i, deleted: false, deleting: false } : i));
              notify.error(err?.response?.data?.message ?? err?.message ?? __('Failed to delete task', 'site-core'), { position: 'bottom-right' });
            })
            .finally(() => setTableItems(prev => prev.filter(i => !i?.deleted)));
          break;
        case 'archive':
          break;
        default:
          break;
      }
    }

  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[priority] || priorityColors.low}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };


  // Task View Component
  const TaskView = ({ task, setPopup }) => {
    return (
      <div className="p-0 max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {task.task_title || `Task #${task.id}`}
              </h3>
              <p className="text-gray-600">Created on {strtotime(task.created_at).format('DD MMM, YY')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <StatusBadge status={task.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Priority</label>
              <div className="mt-1">
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Task Type</label>
            <p className="mt-1 text-gray-900">{taskTypeLabels[task.task_type] || task.task_type}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">
              {task.task_desc || 'No description provided'}
            </p>
          </div>

          {task.task_object && (
            <div>
              <label className="text-sm font-medium text-gray-500">Task Object</label>
              <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900 overflow-x-auto">
                {typeof task.task_object === 'string' ? task.task_object : JSON.stringify(task.task_object, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setPopup(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setPopup(<TaskEdit data={task} setPopup={setPopup} onChange={() => { }} />)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Task
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Task Edit Component
  const TaskEdit = ({ data, setPopup, onChange }) => {
    const [form, setForm] = useState({
      id: data?.id || 0,
      task_title: data?.task_title || '',
      task_desc: data?.task_desc || '',
      task_object: data?.task_object || '',
      task_type: data?.task_type || 'seo_improvements',
      status: data?.status || 'pending',
      priority: data?.priority || 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const taskTypeLabels = {
      plugin_activation_review: 'Plugin Review',
      seo_improvements: 'SEO Optimization',
      new_user_onboarding: 'User Onboarding',
      media_seo: 'Media SEO',
      content_review: 'Content Review',
      bug_fix: 'Bug Fix',
      feature_request: 'Feature Request'
    };

    const validateForm = () => {
      const newErrors = {};
      if (!form.task_title?.trim()) newErrors.task_title = 'Task title is required';
      if (!form.task_desc?.trim()) newErrors.task_desc = 'Task description is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      try {
        await sleep(1500); // Simulate API call

        const updatedTask = {
          ...form,
          created_at: data?.created_at || new Date().toISOString(),
          id: form.id || Date.now()
        };

        onChange(updatedTask);
        notify.success(form.id === 0 ? 'Task created successfully!' : 'Task updated successfully!');
        setPopup(null);
      } catch (error) {
        notify.error('Something went wrong!');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="p-0 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {form.id === 0 ? 'Create New Task' : 'Edit Task'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={form.task_title}
                onChange={(e) => setForm(prev => ({ ...prev, task_title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.task_title ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter task title"
              />
              {errors.task_title && (
                <p className="mt-1 text-sm text-red-600">{errors.task_title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={form.task_type}
                onChange={(e) => setForm(prev => ({ ...prev, task_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(taskTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description *
            </label>
            <textarea
              rows={4}
              value={form.task_desc}
              onChange={(e) => setForm(prev => ({ ...prev, task_desc: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.task_desc ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Describe the task in detail..."
            />
            {errors.task_desc && (
              <p className="mt-1 text-sm text-red-600">{errors.task_desc}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Object (JSON)
            </label>
            <textarea
              rows={6}
              value={form.task_object}
              onChange={(e) => setForm(prev => ({ ...prev, task_object: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder='{"key": "value", "config": {...}}'
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional JSON configuration for the task
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {form.id === 0 ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {form.id === 0 ? 'Create Task' : 'Update Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Delete Confirmation Component
  const DeleteConfirmation = ({ task, setPopup, onDelete }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e) => {
      e.preventDefault();
      setLoading(true);
      await sleep(2000);
      axios.delete(`https://${location.host}/wp-json/sitecore/v1/tasks/${task?.id}`)
        .then(async () => await sleep(2000))
        .then(() => notify.success('Task deleted successfully!'))
        .then(() => onDelete())
        .then(() => setPopup(null))
        .catch(err => notify.error(err?.response?.data?.message ?? err?.message ?? __('Failed to delete task', 'site-core'), { position: 'bottom-right' }))
        .finally(() => (null));
    };

    return (
      <div className="p-0 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
            <p className="text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <strong>"{task.task_title || `Task #${task.id}`}"</strong>?
            This will permanently remove the task and all associated data.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setPopup(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Task
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Task Management</h2>
            <p className="text-gray-600">Manage and track your team's tasks efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPopup(<AIAgentPanel filters={filters} />)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bot className="w-4 h-4" />
              Agent
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => setPopup(<TaskEdit data={{ id: 0 }} setPopup={setPopup} onChange={(data) => setTableItems(prev => [data, ...prev])} />)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </div>

        {/* Task Type Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            ['any', __('All Tasks', 'site-core')],
            ...Object.entries(taskTypeLabels).filter(([key, label]) => insights?.[key]).map(([key, label]) => [key, label])
          ].map(([key, label]) => (
            <a
              key={key}
              href={`#${key},${filters.search},${filters.status},${filters.priority},${filters.orderby},${filters.order}`}
              onClick={() => setFilters(prev => ({ ...prev, task_type: key, page: 1 }))}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${filters.task_type === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
            >
              {label}
              {key !== 'any' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-black/10 rounded-full">
                  {insights?.[key] ?? tableItems.filter(item => item.task_type === key).length}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="any">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{statusConfig[status]?.label || status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="any">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
              <select
                value={`${filters.orderby}-${filters.order}`}
                onChange={(e) => {
                  const [orderby, order] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, orderby, order, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="id-desc">Newest First</option>
                <option value="id-asc">Oldest First</option>
                <option value="priority-desc">High Priority First</option>
                <option value="status-asc">Status</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === tableItems.length && tableItems.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTasks(tableItems.map(item => item.id));
                    } else {
                      setSelectedTasks([]);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading tasks...</span>
                  </div>
                </td>
              </tr>
            ) : tableItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12">
                  <div className="text-center">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first task to get started with task management.
                    </p>
                    <button
                      onClick={() => setPopup(<TaskEdit data={{ id: 0 }} setPopup={setPopup} onChange={(data) => setTableItems(prev => [data, ...prev])} />)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Task
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tableItems.map((task) => (
                <tr
                  key={task.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedTasks.includes(task.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(prev => [...prev, task.id]);
                        } else {
                          setSelectedTasks(prev => prev.filter(id => id !== task.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {task.task_title || `Task #${task.id}`}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {task.task_desc || 'No description provided'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {taskTypeLabels[task.task_type] || task.task_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {strtotime(task.created_at).format('DD MMM, YY')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setPopup(<TaskView task={task} setPopup={setPopup} />)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPopup(<TaskEdit data={task} setPopup={setPopup} onChange={(data) => setTableItems(prev => prev.map(i => i.id === data.id ? data : i))} />)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Task"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Task"
                        disabled={task.deleting}
                        onClick={() => setPopup(<DeleteConfirmation task={task} setPopup={setPopup} onDelete={() => setTableItems(prev => prev.filter(i => i.id !== task.id))} />)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {task.deleting ? <Loader className="w-4 h-4 animate-spin text-gray-200" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(filters.page - 1) * filters.per_page + 1} to {Math.min(filters.page * filters.per_page, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page === 1}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${filters.page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === filters.page - 2 || pageNum === filters.page + 2) {
                return <span key={pageNum} className="px-2 text-gray-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
              disabled={filters.page === pagination.totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {/* {popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {popup}
          </div>
        </div>
      )} */}
      {popup ? <Popup onClose={() => setPopup(null)} showCross={true} backdropClose={true}>{popup}</Popup> : null}
    </div>
  );
};
