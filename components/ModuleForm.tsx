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
  const [steps, setSteps] = useState<{ title: string; tasks: string[] }[]>(
    module?.steps.map(s => ({
      title: s.title,
      tasks: s.tasks.map(t => t.label),
    })) || [{ title: '', tasks: [''] }]
  );

  const handleSubmit = (e: React.FormEvent) => {
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
      id: crypto.randomUUID(),
      title: step.title.trim(),
      description: '',
      tasks: step.tasks.filter(t => t.trim()).map((t, j) => ({
        id: crypto.randomUUID(),
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

    onSave(finalModule);
  };

  const addStep = () => setSteps([...steps, { title: '', tasks: [''] }]);

  const removeStep = (i: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, idx) => idx !== i));
  };

  const updateStepTitle = (i: number, v: string) => {
    const u = [...steps]; u[i].title = v; setSteps(u);
  };

  const addTask = (i: number) => {
    const u = [...steps]; u[i].tasks.push(''); setSteps(u);
  };

  const updateTask = (si: number, ti: number, v: string) => {
    const u = [...steps]; u[si].tasks[ti] = v; setSteps(u);
  };

  const removeTask = (si: number, ti: number) => {
    if (steps[si].tasks.length > 1) {
      const u = [...steps]; u[si].tasks = u[si].tasks.filter((_, i) => i !== ti); setSteps(u);
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
            {steps.map((step, si) => (
              <div key={si} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={step.title}
                    onChange={e => updateStepTitle(si, e.target.value)}
                    placeholder="Judul langkah..."
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => removeStep(si)} className="px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" disabled={steps.length <= 1}>🗑️</button>
                </div>

                <div className="space-y-2">
                  {step.tasks.map((task, ti) => (
                    <div key={ti} className="flex gap-2">
                      <input
                        type="text"
                        value={task}
                        onChange={e => updateTask(si, ti, e.target.value)}
                        placeholder="Checklist task..."
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button type="button" onClick={() => removeTask(si, ti)} className="px-2 text-red-400 hover:text-red-500" disabled={step.tasks.length <= 1}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addTask(si)} className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ Tambah checklist</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addStep} className="w-full py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors">
              + Tambah Langkah
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">
              Batal
            </button>
            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg">
              💾 Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

