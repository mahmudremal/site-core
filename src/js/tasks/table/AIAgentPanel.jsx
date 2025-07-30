import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, StopCircle, RotateCcw, Edit3, Send, Clock, CheckCircle, AlertCircle, PenIcon } from 'lucide-react';
import { JsonEditor } from 'json-edit-react';
import AIAgent from './aiagent';
import { __ } from '@js/utils';

const agent = new AIAgent();

export default function AIAgentPanel({ filters = {} }) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moderate, setModerate] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  
  const pendingTaskTimers = useRef(new Map());

  const addLog = useCallback((msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      message: msg,
      type
    };
    setLogs(prev => [logEntry, ...prev.slice(0, 99)]);
  }, []);

  const handleModerationRequest = useCallback(async (task, result) => {
    return new Promise((resolve) => {
      const pendingTask = {
        id: Date.now(),
        task,
        countdown: 15,
        submitted: false,
        editing: false,
        result: JSON.parse(result),
        resolve // Store the resolve function
      };
      
      setPendingTasks(prev => [pendingTask, ...prev]);
      addLog(`Task ${task.id} pending moderation (15s timeout)`, 'warning');
      
      // Start countdown for this specific task
      const countdownInterval = setInterval(() => {
        setPendingTasks(prev => prev.map(pt => {
          if (pt.id === pendingTask.id && !pt.submitted) {
            if (pt.editing) {
              clearInterval(countdownInterval);
              return { ...pt, countdown: 0 };
            }
            const newCountdown = pt.countdown - 1;
            if (newCountdown <= 0) {
              clearInterval(countdownInterval);
              // Auto-submit when countdown reaches 0
              submitPendingTask(pt.id);
              return { ...pt, countdown: 0 };
            }
            return { ...pt, countdown: newCountdown };
          }
          return pt;
        }));
      }, 1000);

      // Store the interval reference
      pendingTaskTimers.current.set(pendingTask.id, countdownInterval);
    });
  }, [addLog]);

  const submitTaskDirectly = async (task, result) => {
    try {
      const submission = await agent.submitTask(task.id, result);
      addLog(`Task ${task.id} submitted successfully`, 'success');
      return submission;
    } catch (error) {
      addLog(`Task ${task.id} submission failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const submitPendingTask = async (pendingId) => {
    setPendingTasks(prev => prev.map(pt => {
      if (pt.id === pendingId && !pt.submitted) {
        // Clear the timer
        const timer = pendingTaskTimers.current.get(pendingId);
        if (timer) {
          clearInterval(timer);
          pendingTaskTimers.current.delete(pendingId);
        }

        // Submit the task
        submitTaskDirectly(pt.task, pt.result)
          .then(submission => {
            if (pt.resolve) pt.resolve(submission);
          })
          .catch(error => {
            if (pt.resolve) pt.resolve(null);
          });

        return { ...pt, submitted: true };
      }
      return pt;
    }));
    
    // Remove submitted tasks after a delay
    setTimeout(() => {
      setPendingTasks(prev => prev.filter(pt => pt.id !== pendingId));
    }, 2000);
  };

  const setupAgentCallbacks = useCallback(() => {
    const callbacks = {
      filters,
      onLog: addLog,
      onProgress: (progress) => {
        setProcessingProgress(Math.round(progress));
      },
      stream: true,
      onChunk: (chunk) => {
        // console.log('Chunk received:', chunk);
      },
      onFinish: (result) => {
        // console.log('Processing finished:', result);
      },
      onTaskStart: (task) => {
        setCurrentTask(task);
        setProcessingProgress(0);
      },
      onTaskComplete: (task, result, submission) => {
        setCurrentTask(null);
        setProcessingProgress(0);
      }
    };

    // Setup moderation
    if (moderate) {
      agent.setModeration(true, handleModerationRequest);
    } else {
      agent.setModeration(false, null);
    }

    return callbacks;
  }, [addLog, moderate, handleModerationRequest]);

  const startAgent = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    const callbacks = setupAgentCallbacks();
    
    try {
      await agent.startContinuousMode(callbacks);
    } catch (error) {
      addLog(`Agent start failed: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const stopAgent = () => {
    agent.stopAgent();
    setIsRunning(false);
    setCurrentTask(null);
    setProcessingProgress(0);
    
    // Clear all pending countdowns
    pendingTaskTimers.current.forEach(timer => clearInterval(timer));
    pendingTaskTimers.current.clear();
    setPendingTasks(prev => prev.map(pt => ({ ...pt, countdown: 0 })));
    
    addLog('AI Agent stopped', 'warning');
  };

  const runOneTask = async () => {
    if (loading || isRunning) return;
    
    setLoading(true);
    const callbacks = setupAgentCallbacks();
    
    try {
      await agent.runSingleTask(callbacks);
    } catch (error) {
      addLog(`Single task failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setCurrentTask(null);
      setProcessingProgress(0);
    }
  };

  const editPendingTask = (pendingId) => {
    setPendingTasks(prev => prev.map(pt => 
      pt.id === pendingId ? { ...pt, editing: true } : pt
    ));
  };

  const updatePendingTaskResult = (pendingId, newResult) => {
    setPendingTasks(prev => prev.map(pt => 
      pt.id === pendingId ? { ...pt, result: newResult } : pt
    ));
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="xpo_w-3 xpo_h-3 xpo_text-green-500 xpo_flex-shrink-0" />;
      case 'error': return <AlertCircle className="xpo_w-3 xpo_h-3 xpo_text-red-500 xpo_flex-shrink-0" />;
      case 'warning': return <Clock className="xpo_w-3 xpo_h-3 xpo_text-yellow-500 xpo_flex-shrink-0" />;
      default: return <div className="xpo_w-3 xpo_h-3 xpo_bg-blue-500 xpo_rounded-full xpo_flex-shrink-0"></div>;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      agent.stopAgent();
      pendingTaskTimers.current.forEach(timer => clearInterval(timer));
      pendingTaskTimers.current.clear();
    };
  }, []);

  return (
    <div className="xpo_max-w-6xl xpo_mx-auto xpo_space-y-6">
      {/* Header */}
      <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg- xpo_border- xpo_border-gray-200- xpo_p-2">
        <h2 className="xpo_text-3xl xpo_font-bold xpo_mb-6 xpo_text-gray-900 xpo_flex xpo_items-center xpo_gap-3">
          <div className={`xpo_w-3 xpo_h-3 xpo_rounded-full ${isRunning ? 'xpo_bg-green-500 xpo_animate-pulse' : 'xpo_bg-gray-400'}`}></div>
          AI Agent Control Panel
        </h2>
        
        {/* Controls */}
        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_gap-4 xpo_mb-6">
          <button
            onClick={startAgent}
            disabled={isRunning}
            className="xpo_inline-flex xpo_items-center xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_bg-green-600 xpo_text-white hover:xpo_bg-green-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_font-medium xpo_transition-colors"
          >
            <Play className="xpo_w-5 xpo_h-5 xpo_mr-2" />
            Start Continuous Mode
          </button>
          
          <button
            onClick={stopAgent}
            disabled={!isRunning}
            className="xpo_inline-flex xpo_items-center xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_bg-red-600 xpo_text-white hover:xpo_bg-red-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_font-medium xpo_transition-colors"
          >
            <StopCircle className="xpo_w-5 xpo_h-5 xpo_mr-2" />
            Stop Agent
          </button>
          
          <button
            onClick={runOneTask}
            disabled={loading || isRunning}
            className="xpo_inline-flex xpo_items-center xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_bg-blue-600 xpo_text-white hover:xpo_bg-blue-700 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_font-medium xpo_transition-colors"
          >
            <RotateCcw className={`xpo_w-5 xpo_h-5 xpo_mr-2 ${loading ? 'xpo_animate-spin' : ''}`} />
            Run Single Task
          </button>
          
          <label className="xpo_flex xpo_items-center xpo_gap-3 xpo_bg-gray-50 xpo_px-4 xpo_py-3 xpo_rounded-xl xpo_border">
            <input
              type="checkbox"
              checked={moderate}
              disabled={isRunning || loading}
              onChange={(e) => setModerate(e.target.checked)}
              className="xpo_m-0 xpo_w-4 xpo_h-4 xpo_text-blue-600 xpo_rounded"
            />
            <span className="xpo_font-medium xpo_text-gray-700">Enable Moderation</span>
          </label>
        </div>

        {/* Current Task Progress */}
        {currentTask && (
          <div className="xpo_bg-blue-50 xpo_border xpo_border-blue-200 xpo_rounded-xl xpo_p-4">
            <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-2">
              <span className="xpo_font-medium xpo_text-blue-900">
                Processing: {currentTask.id} ({currentTask.task_type})
              </span>
              <span className="xpo_text-blue-700 xpo_font-mono xpo_text-sm">
                {processingProgress}%
              </span>
            </div>
            <div className="xpo_w-full xpo_bg-blue-200 xpo_rounded-full xpo_h-2">
              <div 
                className="xpo_bg-blue-600 xpo_h-2 xpo_rounded-full xpo_transition-all xpo_duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-6">
        {/* Pending Tasks */}
        <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg- xpo_border- xpo_border-gray-200- xpo_p-2">
          <h3 className="xpo_text-xl xpo_font-bold xpo_mb-4 xpo_text-gray-900 xpo_flex xpo_items-center xpo_gap-2">
            <Clock className="xpo_w-5 xpo_h-5 xpo_text-yellow-500" />
            Pending Moderation ({pendingTasks.filter(pt => !pt.submitted).length})
          </h3>
          
          <div className="xpo_space-y-4 xpo_max-h-96 xpo_overflow-y-auto">
            {pendingTasks.filter(pt => !pt.submitted).length === 0 ? (
              <p className="xpo_text-gray-500 xpo_text-center xpo_py-8">No pending tasks</p>
            ) : (
              pendingTasks.filter(pt => !pt.submitted).map((pendingTask) => (
                <div key={pendingTask.id} className="xpo_border xpo_border-yellow-200 xpo_bg-yellow-50 xpo_rounded-xl xpo_p-4">
                  <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-3">
                    <span className="xpo_font-medium xpo_text-yellow-900">
                      Task: {pendingTask.task.id}
                    </span>
                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                      <span className="xpo_text-yellow-700 xpo_font-mono xpo_text-sm">
                        {pendingTask.countdown}s
                      </span>
                      <div className={`xpo_w-2 xpo_h-2 xpo_rounded-full ${pendingTask.countdown > 5 ? 'xpo_bg-yellow-500' : 'xpo_bg-red-500'} xpo_animate-pulse`}></div>
                    </div>
                  </div>
                  
                  <div className="xpo_bg-white xpo_rounded-lg xpo_p-3 xpo_mb-3">
                    {pendingTask.editing ? (
                      <div className="xpo_relative">
                        <JsonEditor
                          data={pendingTask.result}
                          setData={(newValue) => updatePendingTaskResult(pendingTask.id, newValue)}
                        />
                      </div>
                    ) : (
                      <div className="xpo_relative">
                        <pre className="xpo_text-xs xpo_bg-white xpo_p-2 xpo_rounded-md xpo_overflow-auto xpo_max-h-64">
                          {JSON.stringify(pendingTask.result, null, 2)}
                        </pre>
                        <div 
                          className="xpo_absolute xpo_top-0 xpo_right-0 xpo_p-4 xpo_gap-4 xpo_cursor-pointer xpo_bg-white/40 xpo_w-full xpo_h-full xpo_flex xpo_items-center xpo_justify-center" 
                          onClick={() => editPendingTask(pendingTask.id)} 
                          title={__('Edit Result', 'site-core')}
                        >
                          <button className="xpo_flex xpo_items-center xpo_justify-center xpo_px-3 xpo_py-2 xpo_rounded-lg xpo_bg-white xpo_text-gray-500 xpo_text-sm xpo_font-medium xpo_shadow-sm">
                            <PenIcon className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="xpo_flex xpo_gap-2">
                    <button
                      onClick={() => submitPendingTask(pendingTask.id)}
                      className="xpo_flex-1 xpo_inline-flex xpo_items-center xpo_justify-center xpo_px-3 xpo_py-2 xpo_rounded-lg xpo_bg-green-600 xpo_text-white hover:xpo_bg-green-700 xpo_text-sm xpo_font-medium"
                    >
                      <Send className="xpo_w-4 xpo_h-4 xpo_mr-1" />
                      Submit Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg- xpo_border- xpo_border-gray-200- xpo_p-2">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-4">
            <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">Activity Logs</h3>
            <button
              onClick={() => setLogs([])}
              className="xpo_text-sm xpo_text-gray-500 hover:xpo_text-gray-700 xpo_px-3 xpo_py-1 xpo_rounded-lg hover:xpo_bg-gray-100"
            >
              Clear
            </button>
          </div>
          
          <div className="xpo_bg-gray-50 xpo_rounded-xl xpo_p-4 xpo_h-96 xpo_overflow-y-auto xpo_border">
            {logs.length === 0 ? (
              <p className="xpo_text-gray-500 xpo_text-center xpo_py-8">No logs yet</p>
            ) : (
              <div className="xpo_space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="xpo_flex xpo_items-start xpo_gap-3 xpo_text-sm">
                    {getLogIcon(log.type)}
                    <div className="xpo_flex-1 xpo_min-w-0">
                      <span className="xpo_text-gray-500 xpo_font-mono xpo_text-xs">
                        [{log.timestamp}]
                      </span>
                      <span className={`xpo_ml-2 ${
                        log.type === 'error' ? 'xpo_text-red-700' :
                        log.type === 'success' ? 'xpo_text-green-700' :
                        log.type === 'warning' ? 'xpo_text-yellow-700' :
                        'xpo_text-gray-700'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}