import React, { useEffect, useRef, useState } from 'react';
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
      color: 'xpo_bg-yellow-100 xpo_text-yellow-800 xpo_border-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    in_progress: { 
      color: 'xpo_bg-blue-100 xpo_text-blue-800 xpo_border-blue-200',
      icon: Play,
      label: 'In Progress'
    },
    completed: { 
      color: 'xpo_bg-green-100 xpo_text-green-800 xpo_border-green-200',
      icon: CheckCircle,
      label: 'Completed'
    },
    paused: { 
      color: 'xpo_bg-gray-100 xpo_text-gray-800 xpo_border-gray-200',
      icon: Pause,
      label: 'Paused'
    },
    failed: { 
      color: 'xpo_bg-red-100 xpo_text-red-800 xpo_border-red-200',
      icon: AlertCircle,
      label: 'Failed'
    }
  };

  const hashed = window.location.hash.slice(1).split(',');

  const [statuses] = useState(config?.statuses || Object.keys(statusConfig));
  const [taskTypes] = useState(config?.task_types || Object.keys(taskTypeLabels));
  const [pagination, setPagination] = useState({total: 47, totalPages: 3});
  const [tableItems, setTableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    search: hashed[1]??'',
    per_page: 20,
    status: hashed[2]??'pending',
    task_type: taskTypeLabels?.[hashed[0]]?hashed[0]:'any',
    priority: hashed[3]??'any',
    orderby: hashed[4]??'id',
    order: hashed[5]??'desc'
  });
  const [insights, setInsights] = useState({});

  const priorityColors = {
    high: 'xpo_bg-red-50 xpo_text-red-700 xpo_border-red-200',
    medium: 'xpo_bg-yellow-50 xpo_text-yellow-700 xpo_border-yellow-200',
    low: 'xpo_bg-green-50 xpo_text-green-700 xpo_border-green-200'
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      axios.get(`https://${location.host}/wp-json/sitecore/v1/tasks`, {
        params: {...filters},
        headers: {
          'Content-Type': 'application/json',
          // 'X-WP-Nonce': config?._nonce
        },
        // withCredentials: true
      })
      .then(res => {
        setPagination(prev => ({...prev, total: parseInt(res.headers.get('x-wp-total')), totalPages: parseInt(res.headers.get('x-wp-totalpages'))}));
        setTableItems(res.data.map(i => ({...i, task_object: JSON.stringify(i.task_object)})));
      })
      .catch(err => {
        notify.error(err?.response?.data?.message??err?.message??__('Something went wrong!', 'site-core'), {position: 'bottom-right'})
      })
      .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      axios.get(`https://${location.host}/wp-json/sitecore/v1/tasks/insights`, {
        params: {status: filters.status, search: filters.search},
        headers: {
          'Content-Type': 'application/json',
          // 'X-WP-Nonce': config?._nonce
        },
        // withCredentials: true
      })
      .then(res => res.data)
      .then(res => setInsights(res.reduce((p, i) => ({...p, [i.task_type]: Number(i.total)}), {})))
      .catch(err => notify.error(err?.response?.data?.message??err?.message??__('Something went wrong!', 'site-core'), {position: 'bottom-right'}))
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
          setTableItems(prev => prev.map(i => i.id == task_id ? {...i, deleting: true} : i));
          await axios.delete(`https://${location.host}/wp-json/sitecore/v1/tasks/${task_id}`)
          .then(async () => await sleep(2000))
          .then(() => notify.success(sprintf(__('Task %s deleted successfully!', 'site-core'), task_id)))
          .then(() => 
            setTableItems(prev => prev.map(i => i.id == task_id ? {...i, deleted: true} : i))
          )
          // .then(() => setInsights(prev => ({...prev, [tableItems.find(i => i.id == task_id)?.task_type]: prev?.[tableItems.find(i => i.id == task_id)?.task_type]??1 - 1})))
          .catch(err => {
            setTableItems(prev => prev.map(i => i.id == task_id ? {...i, deleted: false, deleting: false} : i));
            notify.error(err?.response?.data?.message??err?.message??__('Failed to delete task', 'site-core'), {position: 'bottom-right'});
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
      <span className={`xpo_inline-flex xpo_items-center xpo_gap-1 xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_border ${config.color}`}>
        <Icon className="xpo_w-3 xpo_h-3" />
        {config.label}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    return (
      <span className={`xpo_inline-flex xpo_items-center xpo_px-2 xpo_py-1 xpo_rounded-md xpo_text-xs xpo_font-medium xpo_border ${priorityColors[priority] || priorityColors.low}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  
  // Task View Component
  const TaskView = ({ task, setPopup }) => {
    return (
      <div className="xpo_p-0 xpo_max-w-2xl">
        <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-6">
          <div className="xpo_flex xpo_items-center xpo_gap-3">
            <div className="xpo_w-12 xpo_h-12 xpo_bg-blue-100 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center">
              <Store className="xpo_w-6 xpo_h-6 xpo_text-blue-600" />
            </div>
            <div>
              <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
                {task.task_title || `Task #${task.id}`}
              </h3>
              <p className="xpo_text-gray-600">Created on {strtotime(task.created_at).format('DD MMM, YY')}</p>
            </div>
          </div>
        </div>

        <div className="xpo_space-y-6">
          <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
            <div>
              <label className="xpo_text-sm xpo_font-medium xpo_text-gray-500">Status</label>
              <div className="xpo_mt-1">
                <StatusBadge status={task.status} />
              </div>
            </div>
            <div>
              <label className="xpo_text-sm xpo_font-medium xpo_text-gray-500">Priority</label>
              <div className="xpo_mt-1">
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>

          <div>
            <label className="xpo_text-sm xpo_font-medium xpo_text-gray-500">Task Type</label>
            <p className="xpo_mt-1 xpo_text-gray-900">{taskTypeLabels[task.task_type] || task.task_type}</p>
          </div>

          <div>
            <label className="xpo_text-sm xpo_font-medium xpo_text-gray-500">Description</label>
            <p className="xpo_mt-1 xpo_text-gray-900 xpo_whitespace-pre-wrap">
              {task.task_desc || 'No description provided'}
            </p>
          </div>

          {task.task_object && (
            <div>
              <label className="xpo_text-sm xpo_font-medium xpo_text-gray-500">Task Object</label>
              <pre className="xpo_mt-1 xpo_p-3 xpo_bg-gray-50 xpo_rounded-lg xpo_text-sm xpo_text-gray-900 xpo_overflow-x-auto">
                {typeof task.task_object === 'string' ? task.task_object : JSON.stringify(task.task_object, null, 2)}
              </pre>
            </div>
          )}

          <div className="xpo_flex xpo_justify-end xpo_gap-3 xpo_pt-4 xpo_border-t">
            <button
              onClick={() => setPopup(null)}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-gray-100 xpo_rounded-lg hover:xpo_bg-gray-200 xpo_transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setPopup(<TaskEdit data={task} setPopup={setPopup} onChange={() => {}} />)}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-blue-600 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
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
      <div className="xpo_p-0 xpo_max-w-3xl">
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
          <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
            {form.id === 0 ? 'Create New Task' : 'Edit Task'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="xpo_space-y-6">
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-6">
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={form.task_title}
                onChange={(e) => setForm(prev => ({...prev, task_title: e.target.value}))}
                className={`xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 ${
                  errors.task_title ? 'xpo_border-red-300' : 'xpo_border-gray-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.task_title && (
                <p className="xpo_mt-1 xpo_text-sm xpo_text-red-600">{errors.task_title}</p>
              )}
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Task Type
              </label>
              <select
                value={form.task_type}
                onChange={(e) => setForm(prev => ({...prev, task_type: e.target.value}))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
              >
                {Object.entries(taskTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({...prev, status: e.target.value}))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm(prev => ({...prev, priority: e.target.value}))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
              Task Description *
            </label>
            <textarea
              rows={4}
              value={form.task_desc}
              onChange={(e) => setForm(prev => ({...prev, task_desc: e.target.value}))}
              className={`xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_resize-none ${
                errors.task_desc ? 'xpo_border-red-300' : 'xpo_border-gray-300'
              }`}
              placeholder="Describe the task in detail..."
            />
            {errors.task_desc && (
              <p className="xpo_mt-1 xpo_text-sm xpo_text-red-600">{errors.task_desc}</p>
            )}
          </div>

          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
              Task Object (JSON)
            </label>
            <textarea
              rows={6}
              value={form.task_object}
              onChange={(e) => setForm(prev => ({...prev, task_object: e.target.value}))}
              className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm xpo_font-mono focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_resize-none"
              placeholder='{"key": "value", "config": {...}}'
            />
            <p className="xpo_mt-1 xpo_text-xs xpo_text-gray-500">
              Optional JSON configuration for the task
            </p>
          </div>

          <div className="xpo_flex xpo_justify-end xpo_gap-3 xpo_pt-4 xpo_border-t xpo_border-gray-200">
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-gray-100 xpo_rounded-lg hover:xpo_bg-gray-200 xpo_transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-blue-600 xpo_rounded-lg hover:xpo_bg-blue-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="xpo_w-4 xpo_h-4 xpo_animate-spin" />
                  {form.id === 0 ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="xpo_w-4 xpo_h-4" />
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
      .catch(err => notify.error(err?.response?.data?.message??err?.message??__('Failed to delete task', 'site-core'), {position: 'bottom-right'}))
      .finally(() => (null));
    };

    return (
      <div className="xpo_p-0 xpo_max-w-xl">
        <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_mb-6">
          <div className="xpo_w-12 xpo_h-12 xpo_bg-red-100 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center">
            <AlertCircle className="xpo_w-6 xpo_h-6 xpo_text-red-600" />
          </div>
          <div>
            <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">Delete Task</h3>
            <p className="xpo_text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-4 xpo_mb-6">
          <p className="xpo_text-sm xpo_text-gray-700">
            Are you sure you want to delete <strong>"{task.task_title || `Task #${task.id}`}"</strong>? 
            This will permanently remove the task and all associated data.
          </p>
        </div>

        <div className="xpo_flex xpo_justify-end xpo_gap-3">
          <button
            onClick={() => setPopup(null)}
            className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-gray-100 xpo_rounded-lg hover:xpo_bg-gray-200 xpo_transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-red-600 xpo_rounded-lg hover:xpo_bg-red-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transition-colors"
          >
            {loading ? (
              <>
                <Loader className="xpo_w-4 xpo_h-4 xpo_animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="xpo_w-4 xpo_h-4" />
                Delete Task
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_border xpo_border-gray-200 xpo_overflow-hidden">
      {/* Header */}
      <div className="xpo_bg-gradient-to-r xpo_from-blue-50 xpo_to-indigo-50 xpo_border-b xpo_border-gray-200 xpo_p-6">
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
          <div>
            <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-1">Task Management</h2>
            <p className="xpo_text-gray-600">Manage and track your team's tasks efficiently</p>
          </div>
          <div className="xpo_flex xpo_items-center xpo_gap-3">
            <button
              onClick={() => setPopup(<AIAgentPanel filters={filters} />)}
              className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_transition-colors"
            >
              <Bot className="xpo_w-4 xpo_h-4" />
              Agent
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_transition-colors"
            >
              <Filter className="xpo_w-4 xpo_h-4" />
              Filters
            </button>
            <button
              onClick={() => setPopup(<TaskEdit data={{id: 0}} setPopup={setPopup} onChange={(data) => setTableItems(prev => [data, ...prev])} />)}
              className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-blue-600 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors xpo_shadow-sm"
            >
              <Plus className="xpo_w-4 xpo_h-4" />
              Create Task
            </button>
          </div>
        </div>

        {/* Task Type Filters */}
        <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
          {[
            ['any', __('All Tasks', 'site-core')],
            ...Object.entries(taskTypeLabels).filter(([key, label]) => insights?.[key]).map(([key, label]) => [key, label])
          ].map(([key, label]) => (
            <a 
              key={key}
              href={`#${key},${filters.search},${filters.status},${filters.priority},${filters.orderby},${filters.order}`}
              onClick={() => setFilters(prev => ({...prev, task_type: key, page: 1}))}
              className={`xpo_px-3 xpo_py-1.5 xpo_text-sm xpo_font-medium xpo_rounded-lg xpo_transition-all ${
                filters.task_type === key 
                  ? 'xpo_bg-blue-600 xpo_text-white xpo_shadow-sm' 
                  : 'xpo_bg-white xpo_text-gray-700 hover:xpo_bg-blue-50 xpo_border xpo_border-gray-200'
              }`}
            >
              {label}
              {key !== 'any' && (
                <span className="xpo_ml-1 xpo_px-1.5 xpo_py-0.5 xpo_text-xs xpo_bg-black/10 xpo_rounded-full">
                  {insights?.[key]??tableItems.filter(item => item.task_type === key).length}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="xpo_bg-gray-50 xpo_border-b xpo_border-gray-200 xpo_p-4">
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-4 xpo_gap-4">
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">Search</label>
              <div className="xpo_relative">
                <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value, page: 1}))}
                  className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value, page: 1}))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
              >
                <option value="any">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{statusConfig[status]?.label || status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value, page: 1}))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
              >
                <option value="any">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">Sort</label>
              <select
                value={`${filters.orderby}-${filters.order}`}
                onChange={(e) => {
                  const [orderby, order] = e.target.value.split('-');
                  setFilters(prev => ({...prev, orderby, order, page: 1}));
                }}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
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
        <div className="xpo_bg-blue-50 xpo_border-b xpo_border-blue-200 xpo_p-4">
          <div className="xpo_flex xpo_items-center xpo_justify-between">
            <span className="xpo_text-sm xpo_text-blue-700">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="xpo_flex xpo_gap-2">
              <button 
                onClick={() => handleBulkAction('archive')}
                className="xpo_px-3 xpo_py-1 xpo_text-sm xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-lg hover:xpo_bg-gray-50"
              >
                Archive
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="xpo_px-3 xpo_py-1 xpo_text-sm xpo_text-white xpo_bg-red-600 xpo_rounded-lg hover:xpo_bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="xpo_overflow-x-auto">
        <table className="xpo_w-full">
          <thead className="xpo_bg-gray-50 xpo_border-b xpo_border-gray-200">
            <tr>
              <th className="xpo_w-12 xpo_px-6 xpo_py-3">
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
                  className="xpo_w-4 xpo_h-4 xpo_text-blue-600 xpo_rounded focus:xpo_ring-blue-500"
                />
              </th>
              <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                Task
              </th>
              <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                Type
              </th>
              <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                Status
              </th>
              <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                Priority
              </th>
              <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                Created
              </th>
              <th className="xpo_px-6 xpo_py-3 xpo_text-center xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="xpo_bg-white xpo_divide-y xpo_divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="xpo_px-6 xpo_py-12 xpo_text-center">
                  <div className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
                    <Loader className="xpo_w-5 xpo_h-5 xpo_animate-spin xpo_text-blue-600" />
                    <span className="xpo_text-gray-600">Loading tasks...</span>
                  </div>
                </td>
              </tr>
            ) : tableItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="xpo_px-6 xpo_py-12">
                  <div className="xpo_text-center">
                    <Store className="xpo_w-12 xpo_h-12 xpo_text-gray-400 xpo_mx-auto xpo_mb-4" />
                    <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">No tasks found</h3>
                    <p className="xpo_text-gray-600 xpo_mb-4">
                      Create your first task to get started with task management.
                    </p>
                    <button
                      onClick={() => setPopup(<TaskEdit data={{id: 0}} setPopup={setPopup} onChange={(data) => setTableItems(prev => [data, ...prev])} />)}
                      className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-blue-600 xpo_rounded-lg hover:xpo_bg-blue-700"
                    >
                      <Plus className="xpo_w-4 xpo_h-4" />
                      Create Your First Task
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tableItems.map((task) => (
                <tr 
                  key={task.id} 
                  className={`hover:xpo_bg-gray-50 xpo_transition-colors ${selectedTasks.includes(task.id) ? 'xpo_bg-blue-50' : ''}`}
                >
                  <td className="xpo_px-6 xpo_py-4">
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
                      className="xpo_w-4 xpo_h-4 xpo_text-blue-600 xpo_rounded focus:xpo_ring-blue-500"
                    />
                  </td>
                  <td className="xpo_px-6 xpo_py-4">
                    <div>
                      <div className="xpo_text-sm xpo_font-medium xpo_text-gray-900 xpo_mb-1">
                        {task.task_title || `Task #${task.id}`}
                      </div>
                      <div className="xpo_text-sm xpo_text-gray-500 xpo_line-clamp-1">
                        {task.task_desc || 'No description provided'}
                      </div>
                    </div>
                  </td>
                  <td className="xpo_px-6 xpo_py-4">
                    <span className="xpo_inline-flex xpo_items-center xpo_px-2.5 xpo_py-0.5 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_bg-gray-100 xpo_text-gray-800">
                      {taskTypeLabels[task.task_type] || task.task_type}
                    </span>
                  </td>
                  <td className="xpo_px-6 xpo_py-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="xpo_px-6 xpo_py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="xpo_px-6 xpo_py-4 xpo_text-sm xpo_text-gray-500">
                    <div className="xpo_flex xpo_items-center xpo_gap-1">
                      <Calendar className="xpo_w-4 xpo_h-4" />
                      {strtotime(task.created_at).format('DD MMM, YY')}
                    </div>
                  </td>
                  <td className="xpo_px-6 xpo_py-4">
                    <div className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-1">
                      <button
                        onClick={() => setPopup(<TaskView task={task} setPopup={setPopup} />)}
                        className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-blue-600 hover:xpo_bg-blue-50 xpo_rounded-lg xpo_transition-colors"
                        title="View Details"
                      >
                        <Eye className="xpo_w-4 xpo_h-4" />
                      </button>
                      <button
                        onClick={() => setPopup(<TaskEdit data={task} setPopup={setPopup} onChange={(data) => setTableItems(prev => prev.map(i => i.id === data.id ? data : i))} />)}
                        className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-green-600 hover:xpo_bg-green-50 xpo_rounded-lg xpo_transition-colors"
                        title="Edit Task"
                      >
                        <SquarePen className="xpo_w-4 xpo_h-4" />
                      </button>
                      <button
                        title="Delete Task"
                        disabled={task.deleting}
                        onClick={() => setPopup(<DeleteConfirmation task={task} setPopup={setPopup} onDelete={() => setTableItems(prev => prev.filter(i => i.id !== task.id))} />)}
                        className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-red-600 hover:xpo_bg-red-50 xpo_rounded-lg xpo_transition-colors"
                      >
                        {task.deleting ? <Loader className="xpo_w-4 xpo_h-4 xpo_animate-spin xpo_text-gray-200" /> : <Trash2 className="xpo_w-4 xpo_h-4" />}
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
      <div className="xpo_bg-gray-50 xpo_px-6 xpo_py-4 xpo_border-t xpo_border-gray-200">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div className="xpo_text-sm xpo_text-gray-700">
            Showing {(filters.page - 1) * filters.per_page + 1} to {Math.min(filters.page * filters.per_page, pagination.total)} of {pagination.total} entries
          </div>
          <div className="xpo_flex xpo_items-center xpo_gap-2">
            <button
              onClick={() => setFilters(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
              disabled={filters.page === 1}
              className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-gray-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_rounded-lg hover:xpo_bg-gray-100"
            >
              <ChevronsLeft className="xpo_w-4 xpo_h-4" />
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
                    onClick={() => setFilters(prev => ({...prev, page: pageNum}))}
                    className={`xpo_px-3 xpo_py-2 xpo_text-sm xpo_font-medium xpo_rounded-lg ${
                      filters.page === pageNum
                        ? 'xpo_bg-blue-600 xpo_text-white'
                        : 'xpo_text-gray-700 hover:xpo_bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === filters.page - 2 || pageNum === filters.page + 2) {
                return <span key={pageNum} className="xpo_px-2 xpo_text-gray-400">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setFilters(prev => ({...prev, page: Math.min(pagination.totalPages, prev.page + 1)}))}
              disabled={filters.page === pagination.totalPages}
              className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-gray-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_rounded-lg hover:xpo_bg-gray-100"
            >
              <ChevronsRight className="xpo_w-4 xpo_h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {/* {popup && (
        <div className="xpo_fixed xpo_inset-0 xpo_bg-black/50 xpo_flex xpo_items-center xpo_justify-center xpo_z-50 xpo_p-4">
          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-xl xpo_w-full xpo_max-w-2xl xpo_max-h-[90vh] xpo_overflow-hidden">
            {popup}
          </div>
        </div>
      )} */}
      {popup ? <Popup onClose={() => setPopup(null)} showCross={true} backdropClose={true}>{popup}</Popup> : null}
    </div>
  );
};
