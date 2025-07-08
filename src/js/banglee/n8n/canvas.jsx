import axios from 'axios';
import { __ } from '@js/utils';
import { sleep } from '@functions';
import { home_route } from '@banglee/core';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, Save, Settings, Trash2, Clock, Zap, Database, Mail, Globe, Code, Loader, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function WorkflowCanvas() {
  const { workflow_id: workflowId } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [saving, setSaving] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [executing, setExecuting] = useState(null);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodePickerPosition, setNodePickerPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const nodePicker = useRef(null);

  const nodeTypes = [
    { type: 'trigger', icon: Zap, label: __('Trigger'), color: 'bg-green-500' },
    { type: 'task', icon: Settings, label: __('Task'), color: 'bg-blue-500' },
    { type: 'http', icon: Globe, label: __('HTTP Request'), color: 'bg-purple-500' },
    { type: 'database', icon: Database, label: __('Database'), color: 'bg-orange-500' },
    { type: 'email', icon: Mail, label: __('Email'), color: 'bg-red-500' },
    { type: 'code', icon: Code, label: __('Code'), color: 'bg-gray-500' },
    { type: 'schedule', icon: Clock, label: __('Schedule'), color: 'bg-yellow-500' },
  ];

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
      fetchNodes();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const response = await axios.get(home_route('n8n', `workflows/${workflowId}`));
      setWorkflow(response.data.workflow);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    }
  };

  const fetchNodes = async () => {
    try {
      const [triggersRes, tasksRes] = await Promise.all([
        axios.get(home_route('n8n', 'triggers')).then(res => res.data),
        axios.get(home_route('n8n', 'tasks')).then(res => res.data)
      ]);
      
      const triggerNodes = triggersRes.triggers
      .filter(t => t.workflow_id == workflowId)
      .map(t => ({ ...t, nodeType: t?.type??'trigger' }));
      
      const taskNodes = tasksRes.tasks
      .filter(t => t.workflow_id == workflowId)
      .map(t => ({ ...t, nodeType: t?.type??'task' }));
      
      setNodes([...triggerNodes, ...taskNodes]);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    if (!e.target.dataset?.canvas) {return;}
    if (nodePicker.current && nodePicker.current.contains(e.target)) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setNodePickerPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setShowNodePicker(true);
  };

  const handleNodeTypeSelect = async (nodeType) => {
    try {
      const newNode = {
        workflow_id: workflowId,
        type: nodeType.type,
        name: `${nodeType.label} ${nodes.length + 1}`,
        config: {...nodePickerPosition},
        nodeType: nodeType.type === 'trigger' ? 'trigger' : 'task'
      };

      let response;
      if (nodeType.type === 'trigger') {
        response = await axios.post(home_route('n8n', 'triggers'), newNode);
      } else {
        response = await axios.post(home_route('n8n', 'tasks'), newNode);
      }

      setNodes(prev => [...prev, { ...newNode, id: response.data.id }]);
      setShowNodePicker(false);
    } catch (error) {
      console.error('Error creating node:', error);
    }
  };

  const handleNodeDragStart = (e, node) => {
    setDragging({ node, offsetX: e.clientX - node.config.x, offsetY: e.clientY - node.config.y });
  };

  const handleNodeDrag = (e) => {
    if (dragging) {
      const newX = e.clientX - dragging.offsetX;
      const newY = e.clientY - dragging.offsetY;
      
      setNodes(prev => prev.map(node => 
        node.id === dragging.node.id 
          ? { ...node, config: {...node?.config??{}, x: newX, y: newY} }
          : node
      ));
    }
  };

  const handleNodeDragEnd = async(e) => {
    if (dragging?.node) {
      const newNode = dragging.node;
      const newX = e.clientX - dragging.offsetX;
      const newY = e.clientY - dragging.offsetY;
      newNode.config = {...newNode.config, x: newX, y: newY};
      if (newNode.type === 'trigger') {
        await axios.post(home_route('n8n', 'triggers'), newNode);
      } else {
        await axios.post(home_route('n8n', 'tasks'), newNode);
      }
    }
    setDragging(null);
  };

  const deleteNode = async (node) => {
    try {
      if (node.nodeType === 'trigger') {
        await axios.delete(home_route('n8n', `triggers/${node.id}`));
      } else {
        await axios.delete(home_route('n8n', `tasks/${node.id}`));
      }
      setNodes(prev => prev.filter(n => n.id !== node.id));
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  const getNodeIcon = (type) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.icon : Settings;
  };

  const getNodeColor = (type) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.color : 'bg-gray-500';
  };

  const executeWorkflow = async () => {
    try {
      await axios.post(home_route('n8n', 'events'), {
        workflow_id: workflowId,
        event_type: 'manual_trigger',
        payload: {}
      });
      alert('Workflow executed successfully!');
    } catch (error) {
      ;
    }
  };

  return (
    <div className="xpo_h-screen xpo_bg-gray-100 xpo_relative xpo_overflow-hidden">
      {/* Header */}
      <div className="xpo_bg-white xpo_shadow-sm xpo_px-6 xpo_py-4 xpo_flex xpo_items-center xpo_justify-between xpo_border-b">
        <div>
          <h1 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
            {workflow?.name || __('Workflow Canvas')}
          </h1>
          <p className="xpo_text-sm xpo_text-gray-600">{__('Design your automation workflow')}</p>
        </div>
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <button
            disabled={executing}
            onClick={(e) => {
              e.preventDefault();
              Promise.resolve(1)
              .then(() => setExecuting(true))
              .then(async () => await sleep(2000))
              .then(async () => await axios.post(home_route('n8n', 'events'), {workflow_id: workflowId, event_type: 'manual_trigger', payload: {}}).then(res => res.data))
              .then(data => alert('Workflow executed successfully!'))
              .catch(err => console.error('Error executing workflow:', err))
              .finally(() => setExecuting(null));
              
            }}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-green-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-green-700 xpo_transition-colors"
          >
            {executing ? <Loader size={16} className="xpo_animate-spin" /> : <Play size={16} />}
            {executing ? __('Executing') : __('Execute')}
          </button>
          <button
            disabled={saving}
            onClick={(e) => {
              e.preventDefault();
              Promise.resolve(1)
              .then(() => setSaving(true))
              .then(async () => await sleep(2000))
              .then(async () => await fetchNodes())
              .catch(err => console.error('Error saving canvas:', err))
              .finally(() => setSaving(null));
            }}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
          >
            {saving ? <Loader size={16} className="xpo_animate-spin" /> : <Save size={16} />}
            {saving ? __('Saving') : __('Save')}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="xpo_relative xpo_w-full xpo_h-full"
        onClick={e => nodePicker.current && !nodePicker.current.contains(e.target) && setShowNodePicker(false)}
        onContextMenu={e => handleCanvasContextMenu(e)}
        onMouseUp={handleNodeDragEnd}
        onMouseMove={handleNodeDrag}
      >
        {/* Grid Background */}
        <div className="xpo_absolute xpo_inset-0 xpo_opacity-10 xpo_cursor-crosshair">
          <div className="xpo_w-full xpo_h-full" data-canvas="true" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Nodes */}
        {nodes.map((node) => {
          const IconComponent = getNodeIcon(node.type);
          return (
            <div
              key={node.id}
              className="xpo_absolute xpo_bg-white xpo_rounded-lg xpo_shadow-md xpo_border-2 xpo_border-gray-200 xpo_cursor-move hover:xpo_shadow-lg xpo_transition-shadow"
              style={{ left: node.config.x, top: node.config.y, width: '200px' }}
              onMouseDown={(e) => handleNodeDragStart(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(node);
              }}
            >
              <div className={`xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_rounded-t-lg ${getNodeColor(node.type)}`}>
                <IconComponent size={20} />
                <span className="xpo_font-medium xpo_text-sm">{node.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node);
                  }}
                  className="xpo_ml-auto xpo_p-1 xpo_rounded hover:xpo_bg-black hover:xpo_bg-opacity-20 xpo_transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="xpo_p-3 xpo_text-xs xpo_text-gray-600">
                <p>Type: {node.type}</p>
                <p>ID: {node.id}</p>
              </div>
            </div>
          );
        })}

        {/* Node Picker */}
        {showNodePicker && (
          <div
            ref={nodePicker}
            className="xpo_absolute xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_border xpo_p-2 xpo_z-50"
            style={{ left: nodePickerPosition.x, top: nodePickerPosition.y }}
          >
            <div className="xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2 xpo_px-2">{__('Add Node')}</div>
            <div className="xpo_grid xpo_grid-cols-1 xpo_gap-1">
              {nodeTypes.map((nodeType) => {
                const IconComponent = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => handleNodeTypeSelect(nodeType)}
                    className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-2 xpo_rounded hover:xpo_bg-gray-100 xpo_transition-colors xpo_text-left"
                  >
                    <div className={`xpo_p-2 xpo_rounded ${nodeType.color}`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="xpo_text-sm xpo_font-medium">{nodeType.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowNodePicker(false)}
              className="xpo_w-full xpo_mt-2 xpo_py-1 xpo_text-xs xpo_text-gray-500 hover:xpo_text-gray-700 xpo_transition-colors"
            >{__('Cancel')}</button>
          </div>
        )}

        {/* Node Configuration Panel */}
        {selectedNode && (
          <div className="xpo_absolute xpo_right-0 xpo_top-0 xpo_h-full xpo_w-80 xpo_bg-white xpo_shadow-lg xpo_border-l xpo_p-4 xpo_overflow-y-auto">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
              <h3 className="xpo_text-lg xpo_font-semibold">Node Configuration</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="xpo_text-gray-500 hover:xpo_text-gray-700"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="xpo_space-y-4">
              <div>
                <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                  {__('Node Name')}
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    setSelectedNode(prev => ({ ...prev, name: e.target.value }));
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, name: e.target.value } : n));
                  }}
                  className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
                />
              </div>
              
              <div>
                <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                  Type
                </label>
                <input
                  disabled
                  type="text"
                  value={selectedNode.type}
                  className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_bg-gray-50"
                />
              </div>
              
              <div>
                <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                  Configuration
                </label>
                <textarea
                  value={JSON.stringify(selectedNode.config || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      // setSelectedNode(prev => ({ ...prev, config: JSON.parse(e.target.value) }));
                      // setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: JSON.parse(e.target.value) } : n));
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 xpo_font-mono xpo_text-sm"
                  rows={6}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center xpo_justify-center xpo_pointer-events-none">
          <div className="xpo_text-center xpo_text-gray-500">
            <Plus size={48} className="xpo_mx-auto xpo_mb-4 xpo_opacity-50" />
            <h3 className="xpo_text-lg xpo_font-medium xpo_mb-2">{__('Start Building Your Workflow')}</h3>
            <p className="xpo_text-sm">{__('Click anywhere on the canvas to add your first node')}</p>
          </div>
        </div>
      )}
    </div>
  );
}