import React, { useEffect, useState } from 'react';
import { Plus, ArrowRight, Search, Filter, Users, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { home_route } from '@banglee/core';
import { __, Popup } from '@js/utils';
import { sprintf } from 'sprintf-js';

const statusColors = {
  active: 'xpo_bg-green-100 xpo_text-green-800 xpo_border-green-200',
  pending: 'xpo_bg-yellow-100 xpo_text-yellow-800 xpo_border-yellow-200',
  denied: 'xpo_bg-red-100 xpo_text-red-800 xpo_border-red-200',
  banned: 'xpo_bg-gray-100 xpo_text-gray-800 xpo_border-gray-200',
};

const Input = ({ placeholder, value, onChange, className = '', ...props }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm xpo_bg-white xpo_transition-all xpo_duration-200 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 hover:xpo_border-gray-400 ${className}`}
    {...props}
  />
);

// Custom Button Component
const Button = ({ children, variant = 'default', size = 'default', onClick, className = '', disabled = false, ...props }) => {
  const baseClasses = 'xpo_inline-flex xpo_items-center xpo_justify-center xpo_rounded-lg xpo_font-medium xpo_transition-all xpo_duration-200 xpo_cursor-pointer disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed';
  
  const variants = {
    default: 'xpo_bg-blue-600 xpo_text-white hover:xpo_bg-blue-700 active:xpo_bg-blue-800',
    secondary: 'xpo_bg-gray-100 xpo_text-gray-700 hover:xpo_bg-gray-200 active:xpo_bg-gray-300',
    ghost: 'xpo_bg-transparent xpo_text-gray-600 hover:xpo_bg-gray-100 active:xpo_bg-gray-200',
    outline: 'xpo_border xpo_border-gray-300 xpo_bg-white xpo_text-gray-700 hover:xpo_bg-gray-50 active:xpo_bg-gray-100'
  };
  
  const sizes = {
    default: 'xpo_px-4 xpo_py-2 xpo_text-sm',
    sm: 'xpo_px-3 xpo_py-1.5 xpo_text-xs',
    icon: 'xpo_w-9 xpo_h-9',
    lg: 'xpo_px-6 xpo_py-3 xpo_text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Badge Component
const Badge = ({ children, className = '' }) => (
  <span className={`xpo_inline-flex xpo_items-center xpo_px-2.5 xpo_py-0.5 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_border ${className}`}>
    {children}
  </span>
);

// Custom Select Component
const Select = ({ value, onChange, options, placeholder, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm xpo_bg-white xpo_transition-all xpo_duration-200 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 hover:xpo_border-gray-400 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Mock data for demonstration
const mockRoom = {
  id: 1,
  title: 'Development Team Room',
  _status: 'active',
  description: 'Main development workspace for the project team'
};

const mockUsers = [
  { id: 1, full_name: 'John Doe', agent_role: 'Developer', _status: 'active' },
  { id: 2, full_name: 'Jane Smith', agent_role: 'Designer', _status: 'pending' },
  { id: 3, full_name: 'Mike Johnson', agent_role: 'Project Manager', _status: 'active' },
  { id: 4, full_name: 'Sarah Wilson', agent_role: 'QA Tester', _status: 'denied' },
  { id: 5, full_name: 'Tom Brown', agent_role: 'DevOps', _status: 'active' },
  { id: 6, full_name: 'Emily Davis', agent_role: 'Technical Writer', _status: 'banned' },
];

const mockAssignments = [
  { id: 1, assignment_type: 'Code Review', tokens_cost: 150 },
  { id: 2, assignment_type: 'Bug Fix', tokens_cost: 200 },
  { id: 3, assignment_type: 'Feature Development', tokens_cost: 500 },
  { id: 4, assignment_type: 'Testing', tokens_cost: 100 },
];

const SingleRoomPage = () => {
  const { workspace_id, room_id } = useParams();
  const [room, setRoom] = useState({});
  const [users, setUsers] = useState(mockUsers);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
  });

  const statusOptions = [
    { value: 'active', label: __('Active') },
    { value: 'pending', label: __('Pending') },
    { value: 'denied', label: __('Denied') },
    { value: 'banned', label: __('Banned') },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(filters.search.toLowerCase()) || user.agent_role.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || user._status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const handleAddUser = () => {
    // Mock function - would typically open a modal or navigate to add user page
    console.log('Add user clicked');
  };

  const handleAddAssignment = () => {
    // Mock function - would typically open a modal or navigate to add assignment page
    console.log('Add assignment clicked');
  };

  const handleAssignmentClick = (assignmentId) => {
    // Mock navigation function
    console.log('Navigate to assignment:', assignmentId);
  };

  const fetchRoom = async () => {
    setLoading(true);
    axios.get(`/agentik/rooms?room_id=${room_id}`)
    .then(res => res.data)
    .then(res => res.data)
    .then(res => res[0] || res)
    .then(res => setRoom(res))
    .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchRoom();
  }, []);
  

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50">
      <div className="xpo_max-w-7xl xpo_mx-auto xpo_px-4 xpo_py-8">
        {/* Room Header */}
        {room && (
          <div className="xpo_mb-8 xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_p-6">
            <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-4">
              <div>
                <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                  {room.title}
                </h1>
                <p className="xpo_text-gray-600 xpo_mb-3">
                  {room.description || 'No description available'}
                </p>
                <Badge className={statusColors[room._status]}>
                  {room._status ? room._status.charAt(0).toUpperCase() + room._status.slice(1) : __('N/A')}
                </Badge>
              </div>
              <div className="xpo_flex xpo_gap-2">
                <Button variant="outline" size="sm">
                  {__('Edit Room')}
                </Button>
                <Button variant="secondary" size="sm">
                  {__('Settings')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        <div className="xpo_mb-8">
          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_p-6">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
              <div className="xpo_flex xpo_items-center xpo_gap-2">
                <Users className="xpo_w-5 xpo_h-5 xpo_text-gray-700" />
                <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
                  {sprintf(__('Users %d'), filteredUsers.length)}
                </h2>
              </div>
              <Button onClick={handleAddUser}>
                <Plus className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                {__('Add User')}
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4 xpo_mb-6">
              <div className="xpo_relative xpo_flex-1">
                <Search className="xpo_absolute xpo_left-3 xpo_top-2.5 xpo_transform -xpo_translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                <Input
                  className="xpo_pl-10"
                  value={filters.search}
                  placeholder={__('Search users by name or role...')}
                  onChange={(e) => setFilters(prev => ({ ...prev, page: 1, search: e.target.value }))}
                />
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-2">
                <Filter className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                <Select
                  className="xpo_w-40"
                  value={filters.status}
                  options={statusOptions}
                  placeholder={__('All Status')}
                  onChange={(e) => setFilters(prev => ({ ...prev, page: 1, status: e.target.value }))}
                />
              </div>
            </div>

            {/* Users Grid */}
            <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_bg-gray-50 xpo_transition-all xpo_duration-200 hover:xpo_shadow-md hover:xpo_bg-white"
                >
                  <div className="xpo_flex xpo_items-start xpo_justify-between">
                    <div className="xpo_flex-1">
                      <h3 className="xpo_text-base xpo_font-semibold xpo_text-gray-900 xpo_mb-1">
                        {user.full_name}
                      </h3>
                      <p className="xpo_text-sm xpo_text-gray-600 xpo_mb-3">
                        {user.agent_role}
                      </p>
                      <Badge className={statusColors[user._status]}>
                        {user._status.charAt(0).toUpperCase() + user._status.slice(1)}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="xpo_ml-2">
                      <ArrowRight className="xpo_w-4 xpo_h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="xpo_text-center xpo_py-8 xpo_text-gray-500">
                {__('No users found matching your criteria.')}
              </div>
            )}
          </div>
        </div>

        {/* Assignments Section */}
        <div className="xpo_mb-8">
          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_p-6">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
              <div className="xpo_flex xpo_items-center xpo_gap-2">
                <ClipboardList className="xpo_w-5 xpo_h-5 xpo_text-gray-700" />
                <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
                  {sprintf(__('Assignments %d'), assignments.length)}
                </h2>
              </div>
              <Button onClick={handleAddAssignment}>
                <Plus className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                {__('Add Assignment')}
              </Button>
            </div>

            {/* Assignments Grid */}
            <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => handleAssignmentClick(assignment.id)}
                  className="xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_bg-gray-50 xpo_transition-all xpo_duration-200 hover:xpo_shadow-md hover:xpo_bg-white xpo_cursor-pointer"
                >
                  <div className="xpo_flex xpo_items-start xpo_justify-between">
                    <div className="xpo_flex-1">
                      <h3 className="xpo_text-base xpo_font-semibold xpo_text-gray-900 xpo_mb-1">
                        {assignment.assignment_type}
                      </h3>
                      <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_text-gray-600">
                        <span>{__('Tokens:')}</span>
                        <span className="xpo_font-medium xpo_text-blue-600">
                          {assignment.tokens_cost}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="xpo_w-4 xpo_h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {assignments.length === 0 && (
              <div className="xpo_text-center xpo_py-8 xpo_text-gray-500">
                {__('No assignments found for this room.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleRoomPage;