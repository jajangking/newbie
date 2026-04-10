"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/Checkbox';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { getAllModules, toggleCompleteModule, getCompleteModules, getTaskState, updateTaskState } from '@/lib/storage';
import type { Module } from '@/lib/modules';

interface TaskState {
  [taskId: string]: boolean;
}

export default function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [taskState, setTaskState] = useState<TaskState>({});
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['step-1']));
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    Promise.all([
      getAllModules(),
      getCompleteModules(),
      getTaskState(),
    ]).then(([data, completeSet, taskStateData]) => {
      setModules(data);
      setIsComplete(completeSet.has(id));
      setTaskState(taskStateData);
      setLoading(false);
    });
  }, [id]);

  const module = modules.find(m => m.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Modul Tidak Ditemukan
          </h2>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const allTasks = module.steps.flatMap(s => s.tasks);
  const completedTasks = allTasks.filter(t => taskState[t.id]).length;
  const allTasksComplete = completedTasks === allTasks.length && allTasks.length > 0;

  const toggleTask = async (taskId: string) => {
    const newState = {
      ...taskState,
      [taskId]: !taskState[taskId],
    };
    setTaskState(newState);
    await updateTaskState(taskId, newState[taskId]);
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepProgress = (step: typeof module.steps[0]) => {
    const completed = step.tasks.filter(t => taskState[t.id]).length;
    return { completed, total: step.tasks.length };
  };

  const resetProgress = async () => {
    const newState = { ...taskState };
    allTasks.forEach(t => delete newState[t.id]);
    setTaskState(newState);
    
    // Update all task states in Supabase
    for (const task of allTasks) {
      await updateTaskState(task.id, false);
    }
  };

  const handleMarkComplete = async () => {
    const newState = await toggleCompleteModule(module.id);
    setIsComplete(newState);

    // Also mark all tasks as complete if marking as done
    if (newState) {
      const fullState = { ...taskState };
      allTasks.forEach(t => fullState[t.id] = true);
      setTaskState(fullState);
      
      // Update all task states in Supabase
      for (const task of allTasks) {
        await updateTaskState(task.id, true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${module.color}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
          
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
              {module.icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="info">{module.category}</Badge>
                <Badge 
                  variant={
                    module.difficulty === 'Beginner' ? 'success' :
                    module.difficulty === 'Intermediate' ? 'warning' : 'default'
                  }
                >
                  {module.difficulty}
                </Badge>
                {allTasksComplete && (
                  <Badge variant="success">✓ Selesai</Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {module.title}
              </h1>
              <p className="text-white/90">
                {module.description}
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <ProgressBar value={completedTasks} max={allTasks.length} />
            <div className="mt-2 text-sm text-white/90">
              {completedTasks}/{allTasks.length} tugas selesai
              {allTasksComplete && ' 🎉'}
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {module.steps.map((step, index) => {
            const isExpanded = expandedSteps.has(step.id);
            const { completed, total } = getStepProgress(step);
            const isStepComplete = completed === total && total > 0;

            return (
              <div
                key={step.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isStepComplete
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {isStepComplete ? '✓' : index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {completed}/{total} tugas selesai
                    </p>
                  </div>

                  <svg
                    className={`w-6 h-6 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Step Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-zinc-200 dark:border-zinc-800">
                    {/* Description */}
                    <div className="pt-4 pb-3">
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {step.description}
                      </p>
                      {step.tip && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 <strong>Tips:</strong> {step.tip}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Task Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">
                        Checklist Tugas
                      </h4>
                      {step.tasks.map(task => (
                        <Checkbox
                          key={task.id}
                          checked={!!taskState[task.id]}
                          onChange={() => toggleTask(task.id)}
                          label={task.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
          >
            ← Kembali ke Beranda
          </button>

          <div className="flex gap-3">
            <button
              onClick={resetProgress}
              className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              🔄 Reset Progress
            </button>

            <button
              onClick={handleMarkComplete}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isComplete
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
              }`}
            >
              {isComplete ? '✅ Sudah Selesai' : '✓ Tandai Selesai'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
