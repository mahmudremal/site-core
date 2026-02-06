import { useState, useEffect, useRef, useCallback } from 'react';
import AIAgent from './aiagent';
import AgentHeader from './AIAgent/AgentHeader';
import TaskProgress from './AIAgent/TaskProgress';
import ModerationList from './AIAgent/ModerationList';
import ActivityLogs from './AIAgent/ActivityLogs';

const agent = new AIAgent();

export default function AIAgentPanel({ filters = {} }) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moderate, setModerate] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState(agent.model);

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

  const submitPendingTask = useCallback(async (pendingId) => {
    setPendingTasks(prev => prev.map(pt => {
      if (pt.id === pendingId && !pt.submitted) {
        const timer = pendingTaskTimers.current.get(pendingId);
        if (timer) {
          clearInterval(timer);
          pendingTaskTimers.current.delete(pendingId);
        }

        submitTaskDirectly(pt.task, pt.result)
          .then(submission => {
            if (pt.resolve) pt.resolve(submission);
          })
          .catch(() => {
            if (pt.resolve) pt.resolve(null);
          });

        return { ...pt, submitted: true };
      }
      return pt;
    }));

    setTimeout(() => {
      setPendingTasks(prev => prev.filter(pt => pt.id !== pendingId));
    }, 2000);
  }, [addLog]);

  const handleModerationRequest = useCallback((task, result) => {
    return new Promise((resolve) => {
      const pendingTask = {
        id: Date.now(),
        task,
        countdown: 15,
        submitted: false,
        editing: false,
        result: typeof result === 'string' ? JSON.parse(result) : result,
        resolve
      };

      setPendingTasks(prev => [pendingTask, ...prev]);
      addLog(`Task ${task.id} pending moderation (15s timeout)`, 'warning');

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
              submitPendingTask(pt.id);
              return { ...pt, countdown: 0 };
            }
            return { ...pt, countdown: newCountdown };
          }
          return pt;
        }));
      }, 1000);

      pendingTaskTimers.current.set(pendingTask.id, countdownInterval);
    });
  }, [addLog, submitPendingTask]);

  const setupAgentCallbacks = useCallback(() => {
    const callbacks = {
      filters,
      onLog: addLog,
      onProgress: (progress) => setProcessingProgress(Math.round(progress)),
      onTaskStart: (task) => {
        setCurrentTask(task);
        setProcessingProgress(0);
      },
      onTaskComplete: () => {
        setCurrentTask(null);
        setProcessingProgress(0);
      }
    };

    agent.set_model(currentModel);
    agent.setModeration(moderate, moderate ? handleModerationRequest : null);

    return callbacks;
  }, [filters, addLog, moderate, handleModerationRequest, currentModel]);

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

  useEffect(() => {
    agent.get_models()
      .then(list => setModels(list))
      .catch(console.error);
    return () => {
      agent.stopAgent();
      pendingTaskTimers.current.forEach(timer => clearInterval(timer));
      pendingTaskTimers.current.clear();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 min-h-full bg-scwhite/20">
      <AgentHeader
        isRunning={isRunning}
        loading={loading}
        models={models}
        currentModel={currentModel}
        onStart={startAgent}
        onStop={stopAgent}
        onRunSingle={runOneTask}
        onModelChange={setCurrentModel}
        moderate={moderate}
        onModerateToggle={setModerate}
      />

      <TaskProgress currentTask={currentTask} progress={processingProgress} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ModerationList
            tasks={pendingTasks}
            onEdit={editPendingTask}
            onUpdate={updatePendingTaskResult}
            onSubmit={submitPendingTask}
          />
        </div>

        <div className="lg:col-span-2">
          <ActivityLogs
            logs={logs}
            onClear={() => setLogs([])}
          />
        </div>
      </div>
    </div>
  );
}
