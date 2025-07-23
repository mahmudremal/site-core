import React, { useEffect, useState } from 'react';
import { Plus, ChevronRight, Users, Calendar, Settings, Search } from 'lucide-react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { home_route } from '@banglee/core';
import { __, Popup } from '@js/utils';
import { sprintf } from 'sprintf-js';

const xpo_statusColors = {
  active: 'xpo_bg-green-100 xpo_text-green-800 xpo_border-green-200',
  pending: 'xpo_bg-yellow-100 xpo_text-yellow-800 xpo_border-yellow-200',
  denied: 'xpo_bg-red-100 xpo_text-red-800 xpo_border-red-200',
  banned: 'xpo_bg-gray-300 xpo_text-gray-800 xpo_border-gray-400',
};


const mockRooms = [
  { id: 1, title: 'Campaign Planning', _status: 'active', member_count: 5, last_activity: '2 hours ago' },
  { id: 2, title: 'Content Creation', _status: 'active', member_count: 8, last_activity: '30 minutes ago' },
  { id: 3, title: 'Design Review', _status: 'pending', member_count: 3, last_activity: '1 day ago' },
  { id: 4, title: 'Analytics Discussion', _status: 'active', member_count: 4, last_activity: '4 hours ago' },
  { id: 5, title: 'Budget Planning', _status: 'denied', member_count: 2, last_activity: '3 days ago' },
  { id: 6, title: 'Social Media Strategy', _status: 'active', member_count: 6, last_activity: '1 hour ago' },
  { id: 7, title: 'Email Marketing', _status: 'banned', member_count: 0, last_activity: '1 week ago' },
  { id: 8, title: 'Event Planning', _status: 'pending', member_count: 7, last_activity: '5 hours ago' },
];

const SingleWorkspacePage = () => {
  const { workspace_id } = useParams();
  const [page, setPage] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [popup, setPopup] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState(null);

  const fetchWorkspace = async () => {
    setLoading(true);
    axios.get(`/agentik/workspaces?id=${workspace_id}`)
    .then(res => res.data)
    .then(res => res.data)
    .then(list => list[0])
    .then(res => setWorkspace(prev => ({ ...prev, ...res })))
    .finally(() => setLoading(false));
  };

  const fetchRooms = async () => {
    setLoading(true);
    axios.get(`/agentik/rooms?workspace_id=${workspace_id}`)
    .then(res => res.data)
    .then(res => res.data)
    .then(list => setRooms(list))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [page, search, status]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'pending': return '🟡';
      case 'denied': return '🔴';
      case 'banned': return '⚫';
      default: return '⚪';
    }
  };

  const EditRoom = ({ data = {} }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({title: '', _status: 'active', ...data});

    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        const response = await axios.post('/agentik/rooms', formData);
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
        <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900 xpo_mb-4">{__('Create New Room')}</h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Room Title')}
            </label>
            <input
              required
              type="text"
              value={formData.title}
              placeholder={__('Enter room title')}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
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
              <option value="active">{__('Active')}</option>
              <option value="pending">{__('Pending')}</option>
              <option value="denied">{__('Denied')}</option>
              <option value="banned">{__('Banned')}</option>
            </select>
          </div>
          
          <div className="xpo_flex xpo_justify-end xpo_gap-2 xpo_pt-4">
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors"
            >{__('Cancel')}</button>
            <button
              type="submit"
              disabled={loading}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-blue-600 xpo_rounded-md hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transition-colors"
            >
              {loading ? __('Creating...') : __('Create Room')}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50">
      <div className="xpo_max-w-7xl xpo_mx-auto xpo_p-6">
        {/* Workspace Header */}
        {workspace && (
          <div className="xpo_mb-8 xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_border xpo_border-gray-200">
            <div className="xpo_p-6">
              <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-4">
                <div>
                  <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                    {workspace.title}
                  </h1>
                  <p className="xpo_text-gray-600 xpo_mb-4">{workspace.description}</p>
                  <div className="xpo_flex xpo_items-center xpo_gap-4">
                    <span className={`xpo_inline-flex xpo_items-center xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-sm xpo_font-medium xpo_border ${xpo_statusColors[workspace._status]}`}>
                      {getStatusIcon(workspace._status)} {workspace._status}
                    </span>
                    <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_text-sm xpo_text-gray-500">
                      <Users className="xpo_w-4 xpo_h-4" />
                      {sprintf(__('%d members'), parseInt(workspace.member_count))}
                    </div>
                    <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_text-sm xpo_text-gray-500">
                      <Calendar className="xpo_w-4 xpo_h-4" />
                      {sprintf(__('Created %s'), workspace.created_at)}
                    </div>
                  </div>
                </div>
                <button className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-gray-600 hover:xpo_bg-gray-50 xpo_rounded-md xpo_transition-colors">
                  <Settings className="xpo_w-5 xpo_h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_justify-between xpo_items-start sm:xpo_items-center xpo_gap-4 xpo_mb-6">
          <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-3 xpo_w-full sm:xpo_w-auto">
            <div className="xpo_relative">
              <Search className="xpo_absolute xpo_left-3 xpo_top-2.5 xpo_transform -xpo_translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
              <input
                type="text"
                placeholder={__('Search rooms...')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="xpo_w-full sm:xpo_w-64 xpo_pl-10 xpo_pr-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_transition-all"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="xpo_border xpo_border-gray-300 xpo_rounded-md xpo_px-3 xpo_py-2 xpo_text-sm xpo_bg-white focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_transition-all"
            >
              <option value="">{__('All Status')}</option>
              <option value="active">{__('Active')}</option>
              <option value="pending">{__('Pending')}</option>
              <option value="denied">{__('Denied')}</option>
              <option value="banned">{__('Banned')}</option>
            </select>
          </div>
          <button
            onClick={e => setPopup(<EditRoom data={{id: 0, workspace_id}} />)}
            className="xpo_flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-md hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors xpo_shadow-sm xpo_whitespace-nowrap"
          >
            <Plus className="xpo_w-4 xpo_h-4 xpo_mr-2" />
            {__('Add Room')}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="xpo_flex xpo_justify-center xpo_items-center xpo_py-12">
            <div className="xpo_animate-spin xpo_rounded-full xpo_h-8 xpo_w-8 xpo_border-b-2 xpo_border-blue-600"></div>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && (
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xl:xpo_grid-cols-4 xpo_gap-6">
            {rooms.map((room, rIndex) => (
              <Link
                key={rIndex}
                to={home_route('agentika', `${workspace_id}/rooms/${room.id}`)}
                className="xpo_group xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_border xpo_border-gray-200 xpo_overflow-hidden hover:xpo_shadow-md xpo_transition-all xpo_duration-200 hover:xpo_scale-105 xpo_cursor-pointer"
              >
                <div className="xpo_p-5">
                  <div className="xpo_flex xpo_justify-between xpo_items-start xpo_mb-3">
                    <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_group-hover:xpo_text-blue-600 xpo_transition-colors">
                      {room.title}
                    </h3>
                    <div className="xpo_opacity-0 xpo_group-hover:xpo_opacity-100 xpo_transition-opacity">
                      <ChevronRight className="xpo_w-5 xpo_h-5 xpo_text-gray-400 xpo_group-hover:xpo_text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="xpo_mb-4">
                    <span className={`xpo_inline-flex xpo_items-center xpo_px-2.5 xpo_py-0.5 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_border ${xpo_statusColors[room._status]}`}>
                      {getStatusIcon(room._status)} {room._status}
                    </span>
                  </div>
                  
                  <div className="xpo_space-y-2">
                    <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_text-gray-600">
                      <Users className="xpo_w-4 xpo_h-4" />
                      <span>{sprintf(__('%d members'), parseInt(room.member_count))}</span>
                    </div>
                    <div className="xpo_text-xs xpo_text-gray-500">
                      {sprintf(__('Last activity: %s'), room.last_activity)}
                    </div>
                  </div>
                </div>
                
                <div className="xpo_h-1 xpo_bg-gradient-to-r xpo_from-blue-500 xpo_to-purple-500 xpo_opacity-0 xpo_group-hover:xpo_opacity-100 xpo_transition-opacity"></div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && rooms.length === 0 && (
          <div className="xpo_text-center xpo_py-12">
            <div className="xpo_text-6xl xpo_mb-4">🏠</div>
            <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">{__('No rooms found')}</h3>
            <p className="xpo_text-gray-500 xpo_mb-6">
              {search || status ? __('Try adjusting your search or filters.') : __('Get started by creating your first room.')}
            </p>
            <button
              onClick={e => setPopup(<EditRoom data={{id: 0, workspace_id}} />)}
              className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-md hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors"
            >
              <Plus className="xpo_w-4 xpo_h-4 xpo_mr-2" />
              {__('Create Room')}
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && rooms.length > 0 && (
          <div className="xpo_flex xpo_justify-center xpo_items-center xpo_mt-8 xpo_gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:hover:xpo_bg-white xpo_transition-colors"
            >{__('Previous')}</button>
            <div className="xpo_flex xpo_items-center xpo_gap-2">
              <span className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-blue-50 xpo_border xpo_border-blue-200 xpo_rounded-md">
                {page}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 xpo_transition-colors"
            >{__('Next')}</button>
          </div>
        )}
      </div>
      {popup ? <Popup onClose={() => setPopup(null)}>{popup}</Popup> : null}
    </div>
  );
};

export default SingleWorkspacePage;