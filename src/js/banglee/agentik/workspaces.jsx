import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronRight, Plus } from 'lucide-react';
import { Popup } from '@js/utils';
import { Link } from 'react-router-dom';
import { home_route, NavMenu } from '@banglee/core';

const xpo_statusColors = {
  active: 'xpo_bg-green-100 xpo_text-green-800',
  pending: 'xpo_bg-yellow-100 xpo_text-yellow-800',
  denied: 'xpo_bg-red-100 xpo_text-red-800',
  banned: 'xpo_bg-gray-300 xpo_text-gray-800',
};

const WorkspacePage = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(null);


  const fetchData = async () => {
    const res = await axios.get('/agentik/workspaces', {
      params: { page, search, _status: status },
    });
    setData(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, [page, search, status]);

  const EditWordSpace = ({ data = {} }) => {
    const [formData, setFormData] = useState({title: '', _status: 'active', ...data});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        const response = await axios.post('/agentik/workspaces', formData);
        if (response.data.success) {
          setPopup(null);
          fetchData();
          setFormData({ title: '', _status: 'active' });
        }
      } catch (error) {
        console.error('Error creating workspace:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="xpo_flex xpo_flex-col xpo_w-96">
        <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900 xpo_mb-4">Create New Workspace</h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              Workspace Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
              placeholder="Enter workspace title"
              required
            />
          </div>
          
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              Status
            </label>
            <select
              value={formData._status}
              onChange={(e) => setFormData({ ...formData, _status: e.target.value })}
              className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-md xpo_px-3 xpo_py-2 xpo_text-sm xpo_bg-white focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="denied">Denied</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          
          <div className="xpo_flex xpo_justify-end xpo_gap-2 xpo_pt-4">
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-blue-600 xpo_rounded-md hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transition-colors"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <>
      <NavMenu />
      <div className="xpo_p-6">
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
          <div className="xpo_flex xpo_gap-2">
            <input
              type="text"
              placeholder="Search workspace..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="xpo_w-64 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="xpo_border xpo_border-gray-300 xpo_rounded-md xpo_px-3 xpo_py-2 xpo_text-sm xpo_bg-white focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="denied">Denied</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <button
            onClick={e => setPopup(
              <EditWordSpace data={{id: 0}} />
            )}
            className="xpo_flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-md hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors"
          >
            <Plus className="xpo_w-4 xpo_h-4 xpo_mr-1" />
            Add Workspace
          </button>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_shadow-sm xpo_flex xpo_justify-between xpo_items-center xpo_bg-white hover:xpo_shadow-md xpo_transition-shadow"
            >
              <div>
                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{item.title}</h3>
                <span className={`xpo_inline-flex xpo_items-center xpo_px-2.5 xpo_py-0.5 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_capitalize ${xpo_statusColors[item._status]}`}>
                  {item._status}
                </span>
              </div>
              <Link to={home_route('agentika', `/${item.id}`)} className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600 hover:xpo_bg-gray-50 xpo_rounded-md xpo_transition-colors">
                <ChevronRight className="xpo_w-5 xpo_h-5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="xpo_flex xpo_justify-center xpo_items-center xpo_mt-6 xpo_gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:hover:xpo_bg-white xpo_transition-colors"
          >
            Prev
          </button>
          <span className="xpo_px-4 xpo_text-sm xpo_font-medium xpo_text-gray-700">{page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors"
          >
            Next
          </button>
        </div>

        {popup ? <Popup onClose={() => setPopup(null)}>{popup}</Popup> : null}
        
      </div>
    </>
  );
};

export default WorkspacePage;