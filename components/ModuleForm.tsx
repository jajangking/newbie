"use client";

import { useState } from 'react';
import type { Module, Step } from '@/lib/modules';

interface ModuleFormProps {
  module?: Module | null;
  onSave: (module: Module) => void;
  onClose: () => void;
}

interface ModuleFormData {
  title: string;
  category: string;
  steps: { title: string; tasks: string[] }[];
}

export function ModuleForm({ module, onSave, onClose }: ModuleFormProps) {
  const [title, setTitle] = useState(module?.title || '');
  const [category, setCategory] = useState(module?.category || '');
  const [saving, setSaving] = useState(false);
  const [steps, setSteps] = useState<{ title: string; tasks: string[]; stepId?: string; taskIds?: string[] }[]>(
    module?.steps.map(s => ({
      title: s.title,
      tasks: s.tasks.map(t => t.label),
      stepId: s.id,
      taskIds: s.tasks.map(t => t.id),
    })) || [{ title: '', tasks: [''], stepId: undefined, taskIds: undefined }]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category.trim()) {
      alert('Isi judul dan kategori!');
      return;
    }

    const validSteps = steps.filter(s => s.title.trim());
    if (validSteps.length === 0) {
      alert('Minimal isi 1 langkah!');
      return;
    }

    for (const step of validSteps) {
      const validTasks = step.tasks.filter(t => t.trim());
      if (validTasks.length === 0) {
        alert(`Step "${step.title}" belum ada checklist!`);
        return;
      }
    }

    const finalSteps: Step[] = validSteps.map((step, i) => ({
      id: step.stepId || crypto.randomUUID(),
      title: step.title.trim(),
      description: '',
      tasks: step.tasks.filter(t => t.trim()).map((t, j) => ({
        id: step.taskIds?.[j] || crypto.randomUUID(),
        label: t.trim(),
        completed: false,
      })),
    }));

    const finalModule: Module = {
      id: module?.id || crypto.randomUUID(),
      title: title.trim(),
      description: title.trim(),
      category: category.trim(),
      icon: '📋',
      color: 'from-blue-500 to-purple-500',
      difficulty: 'Beginner' as const,
      steps: finalSteps,
    };

    setSaving(true);
    await onSave(finalModule);
    setSaving(false);
  };

  const addStep = () => setSteps([...steps, { title: '', tasks: [''], stepId: undefined, taskIds: undefined }]);

  const removeStep = (i: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, idx) => idx !== i));
  };

  const updateStepTitle = (i: number, v: string) => {
    const u = [...steps]; u[i].title = v; setSteps(u);
  };

  const addTask = (i: number) => {
    const u = [...steps];
    u[i].tasks.push('');
    // Add undefined placeholder for task ID to keep alignment
    if (u[i].taskIds) {
      u[i].taskIds.push(undefined as unknown as string);
    }
    setSteps(u);
  };

  const updateTask = (si: number, ti: number, v: string) => {
    const u = [...steps];
    u[si].tasks[ti] = v;
    setSteps(u);
  };

  const removeTask = (si: number, ti: number) => {
    if (steps[si].tasks.length > 1) {
      const u = [...steps];
      u[si].tasks = u[si].tasks.filter((_, i) => i !== ti);
      // Also remove the task ID
      if (u[si].taskIds) {
        u[si].taskIds = u[si].taskIds.filter((_, i) => i !== ti);
      }
      setSteps(u);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 pb-8 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {module ? '✏️ Edit' : '➕ Tambah Panduan'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Judul */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Judul panduan (misal: Printer error E-01)"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />

          {/* Kategori */}
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Kategori (Printer/Internet/Kasir/dll)"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">
                Langkah-langkah
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {steps.filter(s => s.title.trim()).length} langkah
              </span>
            </div>

            {steps.map((step, si) => (
              <div key={si} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    {si + 1}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={e => updateStepTitle(si, e.target.value)}
                    placeholder="Judul langkah..."
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(si)}
                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Hapus langkah"
                    disabled={steps.length <= 1}
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-2 ml-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Checklist ({step.tasks.filter(t => t.trim()).length}/{step.tasks.length})
                    </span>
                  </div>
                  {step.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-center gap-2">
                      <span className="flex-shrink-0 text-zinc-400 text-sm">☐</span>
                      <input
                        type="text"
                        value={task}
                        onChange={e => updateTask(si, ti, e.target.value)}
                        placeholder="Checklist task..."
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeTask(si, ti)}
                        className="flex-shrink-0 p-1 text-red-400 hover:text-red-500 transition-colors"
                        title="Hapus task"
                        disabled={step.tasks.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addTask(si)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                  >
                    <span>+</span> Tambah checklist
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Tambah Langkah
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>💾 Simpan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

