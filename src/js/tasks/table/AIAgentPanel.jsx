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
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />;
      case 'warning': return <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />;
      default: return <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>;
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg- border- border-gray-200- p-2">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          AI Agent Control Panel
        </h2>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={startAgent}
            disabled={isRunning}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Continuous Mode
          </button>

          <button
            onClick={stopAgent}
            disabled={!isRunning}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Stop Agent
          </button>

          <button
            onClick={runOneTask}
            disabled={loading || isRunning}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <RotateCcw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Single Task
          </button>

          <label className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border">
            <input
              type="checkbox"
              checked={moderate}
              disabled={isRunning || loading}
              onChange={(e) => setModerate(e.target.checked)}
              className="m-0 w-4 h-4 text-blue-600 rounded"
            />
            <span className="font-medium text-gray-700">Enable Moderation</span>
          </label>
        </div>

        {/* Current Task Progress */}
        {currentTask && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-blue-900">
                Processing: {currentTask.id} ({currentTask.task_type})
              </span>
              <span className="text-blue-700 font-mono text-sm">
                {processingProgress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl shadow-lg- border- border-gray-200- p-2">
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Moderation ({pendingTasks.filter(pt => !pt.submitted).length})
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pendingTasks.filter(pt => !pt.submitted).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending tasks</p>
            ) : (
              pendingTasks.filter(pt => !pt.submitted).map((pendingTask) => (
                <div key={pendingTask.id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-yellow-900">
                      Task: {pendingTask.task.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-700 font-mono text-sm">
                        {pendingTask.countdown}s
                      </span>
                      <div className={`w-2 h-2 rounded-full ${pendingTask.countdown > 5 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 mb-3">
                    {pendingTask.editing ? (
                      <div className="relative">
                        <JsonEditor
                          data={pendingTask.result}
                          setData={(newValue) => updatePendingTaskResult(pendingTask.id, newValue)}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <pre className="text-xs bg-white p-2 rounded-md overflow-auto max-h-64">
                          {JSON.stringify(pendingTask.result, null, 2)}
                        </pre>
                        <div
                          className="absolute top-0 right-0 p-4 gap-4 cursor-pointer bg-white/40 w-full h-full flex items-center justify-center"
                          onClick={() => editPendingTask(pendingTask.id)}
                          title={__('Edit Result', 'site-core')}
                        >
                          <button className="flex items-center justify-center px-3 py-2 rounded-lg bg-white text-gray-500 text-sm font-medium shadow-sm">
                            <PenIcon className="w-4 h-4 text-gray-500" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => submitPendingTask(pendingTask.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Submit Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-2xl shadow-lg- border- border-gray-200- p-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Activity Logs</h3>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 h-96 overflow-y-auto border">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs yet</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-500 font-mono text-xs">
                        [{log.timestamp}]
                      </span>
                      <span className={`ml-2 ${log.type === 'error' ? 'text-red-700' :
                          log.type === 'success' ? 'text-green-700' :
                            log.type === 'warning' ? 'text-yellow-700' :
                              'text-gray-700'
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