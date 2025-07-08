import axios from 'axios';
import { home_route } from '@banglee/core';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Pause, Calendar, Zap, List, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { __ } from '@js/utils';
import { sprintf } from 'sprintf-js';


export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({ name: '', active: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(home_route('n8n', 'workflows'));
      setWorkflows(response.data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        ...(editingWorkflow && { id: editingWorkflow.id })
      };
      
      await axios.post(home_route('n8n', 'workflows'), payload);
      
      setFormData({ name: '', active: true });
      setShowCreateForm(false);
      setEditingWorkflow(null);
      fetchWorkflows();
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setFormData({ name: workflow.name, active: workflow.active });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await axios.delete(home_route('n8n', `workflows/${id}`));
        fetchWorkflows();
      } catch (error) {
        console.error('Error deleting workflow:', error);
      }
    }
  };

  const toggleActive = async (workflow) => {
    try {
      await axios.post(home_route('n8n', 'workflows'), {
        id: workflow.id,
        name: workflow.name,
        active: !workflow.active
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_p-6">
      <div className="xpo_max-w-7xl xpo_mx-auto">
        {/* Header */}
        <div className="xpo_mb-8">
          <div className="xpo_flex xpo_items-center xpo_justify-between">
            <div>
              <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900">Workflows</h1>
              <p className="xpo_text-gray-600 xpo_mt-2">Manage your automation workflows</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
            >
              <Plus size={20} />
              New Workflow
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_bg-opacity-50 xpo_flex xpo_items-center xpo_justify-center xpo_z-50">
            <div className="xpo_bg-white xpo_p-6 xpo_rounded-lg xpo_w-full xpo_max-w-md">
              <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4">
                {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="xpo_mb-4">
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
                    required
                  />
                </div>
                <div className="xpo_mb-6">
                  <label className="xpo_flex xpo_items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="xpo_mr-2"
                    />
                    <span className="xpo_text-sm xpo_text-gray-700">Active</span>
                  </label>
                </div>
                <div className="xpo_flex xpo_gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="xpo_flex-1 xpo_bg-blue-600 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded-md hover:xpo_bg-blue-700 xpo_disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingWorkflow ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingWorkflow(null);
                      setFormData({ name: '', active: true });
                    }}
                    className="xpo_flex-1 xpo_bg-gray-300 xpo_text-gray-700 xpo_py-2 xpo_px-4 xpo_rounded-md hover:xpo_bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Workflows Grid */}
        {loading ? (
          <div className="xpo_flex xpo_justify-center xpo_items-center xpo_h-64">
            <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-600"></div>
          </div>
        ) : (
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="xpo_bg-white xpo_rounded-lg xpo_shadow-md xpo_p-6 hover:xpo_shadow-lg xpo_transition-shadow">
                <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-4">
                  <div>
                    <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{workflow.name}</h3>
                    <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-1">
                      Created: {new Date(workflow.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="xpo_flex xpo_items-center xpo_gap-2">
                    <span className={`xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-medium ${
                      workflow.active 
                        ? 'xpo_bg-green-100 xpo_text-green-800' 
                        : 'xpo_bg-gray-100 xpo_text-gray-800'
                    }`}>
                      {workflow.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_text-sm xpo_text-gray-600 xpo_mb-4">
                  <div className="xpo_flex xpo_items-center xpo_gap-1">
                    <Zap size={16} />
                    <span>{sprintf(__('%d Triggers'), workflow.trigger_count)}</span>
                  </div>
                  <div className="xpo_flex xpo_items-center xpo_gap-1">
                    <List size={16} />
                    <span>{sprintf(__('%d Tasks'), workflow.task_count)}</span>
                  </div>
                  {/* <div className="xpo_flex xpo_items-center xpo_gap-1">
                    <List size={16} />
                    <span>{sprintf(__('%d Events'), workflow.event_count)}</span>
                  </div> */}
                </div>

                <div className="xpo_flex xpo_items-center xpo_gap-2">
                  <Link
                    to={home_route('tasks', `${workflow.id}/view`)}
                    className={`xpo_flex xpo_items-center xpo_gap-1 xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_bg-green-100 xpo_text-green-700 hover:xpo_bg-green-200 xpo_transition-colors`}
                  >
                    {<Eye size={14} />} {__('View')}
                  </Link>
                  <button
                    onClick={() => toggleActive(workflow)}
                    className={`xpo_flex xpo_items-center xpo_gap-1 xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_transition-colors ${
                      workflow.active
                        ? 'xpo_bg-orange-100 xpo_text-orange-700 hover:xpo_bg-orange-200'
                        : 'xpo_bg-green-100 xpo_text-green-700 hover:xpo_bg-green-200'
                    }`}
                  >
                    {workflow.active ? <Pause size={14} /> : <Play size={14} />}
                    {workflow.active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(workflow)}
                    className="xpo_flex xpo_items-center xpo_gap-1 xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_bg-blue-100 xpo_text-blue-700 hover:xpo_bg-blue-200 xpo_transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="xpo_flex xpo_items-center xpo_gap-1 xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_bg-red-100 xpo_text-red-700 hover:xpo_bg-red-200 xpo_transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {workflows.length === 0 && !loading && (
          <div className="xpo_text-center xpo_py-12">
            <div className="xpo_text-gray-400 xpo_mb-4">
              <Calendar size={48} className="xpo_mx-auto" />
            </div>
            <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">No workflows yet</h3>
            <p className="xpo_text-gray-600 xpo_mb-4">Get started by creating your first workflow</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
            >
              Create Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}