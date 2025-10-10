import React, { useEffect, useState } from 'react';
import { Plus, ArrowRight, Search, Filter, Users, ClipboardList, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { home_route, NavMenu } from '@banglee/core';
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

const Badge = ({ children, className = '' }) => (
  <span className={`xpo_inline-flex xpo_items-center xpo_px-2.5 xpo_py-0.5 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_border ${className}`}>
    {children}
  </span>
);

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

const SingleRoomPage = () => {
  const { workspace_id, room_id } = useParams();
  const [room, setRoom] = useState({});
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState({
    room: false,
    users: false,
    assignments: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
  });
  
  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [assignmentsPage, setAssignmentsPage] = useState(1);

  const statusOptions = [
    { value: 'active', label: __('Active') },
    { value: 'pending', label: __('Pending') },
    { value: 'denied', label: __('Denied') },
    { value: 'banned', label: __('Banned') },
  ];

  // Fetch room data
  const fetchRoom = async () => {
    setLoading(prev => ({ ...prev, room: true }));
    axios.get(`/agentik/rooms/${room_id}`)
    .then(res => res.data)
    .then(res => {
      if (res.success) {
        return res.data;
      }
      throw new Error(res.error || __('Failed to fetch room data'));
    })
    .then(res => setRoom(res))
    .catch(err => console.error('Error fetching room:', err))
    .finally(() => setLoading(prev => ({ ...prev, room: false })));
  };

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await axios.get(`/agentik/${room_id}/users`, {
        params: {
          page: usersPage,
          search: filters.search,
          _status: filters.status,
          // room_id: room_id
        }
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Fetch assignments data
  const fetchAssignments = async () => {
    setLoading(prev => ({ ...prev, assignments: true }));
    try {
      const response = await axios.get('/agentik/assignments', {
        params: {
          page: assignmentsPage,
          search: '',
        }
      });
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRoom();
  }, [room_id]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers();
    }, 1000);

    return () => clearTimeout(delay);
  }, [room_id, usersPage, filters.search, filters.status]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAssignments();
    }, 1000);

    return () => clearTimeout(delay);
  }, [assignmentsPage]);

  // Add User Component
  const AddUserForm = () => {
    const [formData, setFormData] = useState({
      full_name: '',
      nicename: '',
      agent_role: '',
      _status: 'active'
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      
      try {
        const response = await axios.post(`/agentik/${room_id}/users`, formData);
        if (response.data.success) {
          setPopup(null);
          fetchUsers();
          setFormData({ full_name: '', nicename: '', agent_role: '', _status: 'active' });
        }
      } catch (error) {
        console.error('Error creating user:', error);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="xpo_flex xpo_flex-col xpo_w-96">
        <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900 xpo_mb-4">{__('Add New User')}</h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Full Name')}
            </label>
            <Input
              required
              value={formData.full_name}
              placeholder={__('Enter full name')}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Nickname')}
            </label>
            <Input
              required
              value={formData.nicename}
              placeholder={__('Enter nickname')}
              onChange={(e) => setFormData(prev => ({ ...prev, nicename: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Agent Role')}
            </label>
            <select
              value={formData.agent_role}
              onChange={(e) => setFormData(prev => ({ ...prev, agent_role: e.target.value }))}
              className="xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm xpo_bg-white xpo_transition-all xpo_duration-200 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 hover:xpo_border-gray-400"
            >
              <option value="member">{__('Member')}</option>
              <option value="admin">{__('Admin')}</option>
              <option value="moderator">{__('Moderator')}</option>
            </select>
          </div>
          
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Status')}
            </label>
            <Select
              value={formData._status}
              options={statusOptions}
              onChange={(e) => setFormData(prev => ({ ...prev, _status: e.target.value }))}
            />
          </div>
          
          <div className="xpo_flex xpo_justify-end xpo_gap-2 xpo_pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPopup(null)}
            >
              {__('Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? __('Adding...') : __('Add User')}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Add Assignment Component
  const AddAssignmentForm = () => {
    const [formData, setFormData] = useState({
      assignment_type: '',
      tokens_cost: '',
      budgets: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      
      try {
        const response = await axios.post('/agentik/assignments', {
          ...formData,
          tokens_cost: parseInt(formData.tokens_cost),
          budgets: parseFloat(formData.budgets)
        });
        if (response.data.success) {
          setPopup(null);
          fetchAssignments();
          setFormData({ assignment_type: '', tokens_cost: '', budgets: '' });
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="xpo_flex xpo_flex-col xpo_w-96">
        <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900 xpo_mb-4">{__('Add New Assignment')}</h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Assignment Type')}
            </label>
            <Input
              required
              value={formData.assignment_type}
              placeholder={__('Enter assignment type')}
              onChange={(e) => setFormData(prev => ({ ...prev, assignment_type: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Tokens Cost')}
            </label>
            <Input
              required
              type="number"
              value={formData.tokens_cost}
              placeholder={__('Enter tokens cost')}
              onChange={(e) => setFormData(prev => ({ ...prev, tokens_cost: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Budget')}
            </label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.budgets}
              placeholder={__('Enter budget')}
              onChange={(e) => setFormData(prev => ({ ...prev, budgets: e.target.value }))}
            />
          </div>
          
          <div className="xpo_flex xpo_justify-end xpo_gap-2 xpo_pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPopup(null)}
            >
              {__('Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? __('Adding...') : __('Add Assignment')}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const handleAddUser = () => {
    setPopup(<AddUserForm />);
  };

  const handleAddAssignment = () => {
    setPopup(<AddAssignmentForm />);
  };

  const handleAssignmentClick = (assignmentId) => {
    // Navigate to assignment details or handle assignment click
    console.log('Navigate to assignment:', assignmentId);
  };

  return (
    <>
      <NavMenu />
      <div className="xpo_min-h-screen xpo_bg-gray-50">
        <div className="xpo_container xpo_mx-auto xpo_px-4 xpo_py-8">
          {/* Room Header */}
          {loading.room ? (
            <div className="xpo_mb-8 xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_p-6">
              <div className="xpo_animate-pulse">
                <div className="xpo_h-8 xpo_bg-gray-200 xpo_rounded xpo_w-1/3 xpo_mb-4"></div>
                <div className="xpo_h-4 xpo_bg-gray-200 xpo_rounded xpo_w-2/3 xpo_mb-2"></div>
                <div className="xpo_h-6 xpo_bg-gray-200 xpo_rounded xpo_w-20"></div>
              </div>
            </div>
          ) : room.id ? (
            <div className="xpo_mb-8 xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_p-6">
              <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-4">
                <div>
                  <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                    {room.title}
                  </h1>
                  <p className="xpo_text-gray-600 xpo_mb-3">
                    {room.description || __('No description available')}
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
                    <Settings className="xpo_w-4 xpo_h-4 xpo_mr-1" />
                    {__('Settings')}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Users Section */}
          <div className="xpo_mb-8">
            <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-sm xpo_p-6">
              <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
                <div className="xpo_flex xpo_items-center xpo_gap-2">
                  <Users className="xpo_w-5 xpo_h-5 xpo_text-gray-700" />
                  <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
                    {sprintf(__('Users (%d)'), users.length)}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  />
                </div>
                <div className="xpo_flex xpo_items-center xpo_gap-2">
                  <Filter className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                  <Select
                    className="xpo_w-40"
                    value={filters.status}
                    options={statusOptions}
                    placeholder={__('All Status')}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  />
                </div>
              </div>

              {/* Users Grid */}
              {loading.users ? (
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_bg-gray-50 xpo_animate-pulse">
                      <div className="xpo_h-4 xpo_bg-gray-200 xpo_rounded xpo_w-3/4 xpo_mb-2"></div>
                      <div className="xpo_h-3 xpo_bg-gray-200 xpo_rounded xpo_w-1/2 xpo_mb-3"></div>
                      <div className="xpo_h-5 xpo_bg-gray-200 xpo_rounded xpo_w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_bg-gray-50 xpo_transition-all xpo_duration-200 hover:xpo_shadow-md hover:xpo_bg-white"
                    >
                      <div className="xpo_flex xpo_items-start xpo_justify-between">
                        <div className="xpo_flex-1">
                          <h3 className="xpo_text-base xpo_font-semibold xpo_text-gray-900 xpo_mb-1">
                            {user.full_name}
                          </h3>
                          <p className="xpo_text-sm xpo_text-gray-600 xpo_mb-1">
                            {user.nicename && `@${user.nicename}`}
                          </p>
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
              )}

              {!loading.users && users.length === 0 && (
                <div className="xpo_text-center xpo_py-8 xpo_text-gray-500">
                  {__('No users found matching your criteria.')}
                </div>
              )}

              {/* Users Pagination */}
              {users.length > 0 && (
                <div className="xpo_flex xpo_justify-center xpo_items-center xpo_mt-6 xpo_gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                  >
                    <ChevronLeft className="xpo_w-4 xpo_h-4" />
                    {__('Previous')}
                  </Button>
                  <span className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                    {usersPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage(p => p + 1)}
                    disabled={users.length < 20}
                  >
                    {__('Next')}
                    <ChevronRight className="xpo_w-4 xpo_h-4" />
                  </Button>
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
                    {sprintf(__('Assignments (%d)'), assignments.length)}
                  </h2>
                </div>
                <Button onClick={handleAddAssignment}>
                  <Plus className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                  {__('Add Assignment')}
                </Button>
              </div>

              {/* Assignments Grid */}
              {loading.assignments ? (
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_bg-gray-50 xpo_animate-pulse">
                      <div className="xpo_h-4 xpo_bg-gray-200 xpo_rounded xpo_w-3/4 xpo_mb-2"></div>
                      <div className="xpo_h-3 xpo_bg-gray-200 xpo_rounded xpo_w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
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
                          <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_text-sm xpo_text-gray-600">
                            <div className="xpo_flex xpo_items-center xpo_gap-1">
                              <span>{__('Tokens:')}</span>
                              <span className="xpo_font-medium xpo_text-blue-600">
                                {assignment.tokens_cost}
                              </span>
                            </div>
                            {assignment.budgets && (
                              <div className="xpo_flex xpo_items-center xpo_gap-1">
                                <span>{__('Budget:')}</span>
                                <span className="xpo_font-medium xpo_text-green-600">
                                  ${assignment.budgets}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="xpo_w-4 xpo_h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading.assignments && assignments.length === 0 && (
                <div className="xpo_text-center xpo_py-8 xpo_text-gray-500">
                  {__('No assignments found for this room.')}
                </div>
              )}

              {/* Assignments Pagination */}
              {assignments.length > 0 && (
                <div className="xpo_flex xpo_justify-center xpo_items-center xpo_mt-6 xpo_gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignmentsPage(p => Math.max(1, p - 1))}
                    disabled={assignmentsPage === 1}
                  >
                    <ChevronLeft className="xpo_w-4 xpo_h-4" />
                    {__('Previous')}
                  </Button>
                  <span className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                    {assignmentsPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignmentsPage(p => p + 1)}
                    disabled={assignments.length < 20}
                  >
                    {__('Next')}
                    <ChevronRight className="xpo_w-4 xpo_h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        {popup ? <Popup onClose={() => setPopup(null)}>{popup}</Popup> : null}
      </div>
    </>
  );
};

export default SingleRoomPage;