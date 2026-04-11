"use client";

import { useState, useEffect, useCallback } from 'react';
import { ModuleCard } from '@/components/ModuleCard';
import { ModuleForm } from '@/components/ModuleForm';
import type { Module } from '@/lib/modules';
import { getAllModules, addModule, updateModule, deleteModule, getTaskState } from '@/lib/storage';
import Link from 'next/link';

interface TaskState {
  [taskId: string]: boolean;
}

export default function Home() {
  const [modules, setModules] = useState<Module[]>([]);
  const [taskState, setTaskState] = useState<TaskState>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    setLoading(true);
    const [data, taskStateData] = await Promise.all([
      getAllModules(),
      getTaskState(),
    ]);
    setModules(data);
    setTaskState(taskStateData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const handleSave = async (module: Module) => {
    if (editingModule) {
      const updated = await updateModule(module.id, module);
      setModules(updated);
    } else {
      const updated = await addModule(module);
      setModules(updated);
    }
    setShowForm(false);
    setEditingModule(null);
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin mau hapus panduan ini?')) return;
    const updated = await deleteModule(id);
    setModules(updated);
  };

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(search.toLowerCase()) ||
                         module.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || module.category === filter;
    return matchesSearch && matchesFilter;
  });

  const getModuleProgress = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return { completed: 0, total: 0 };
    
    const allTasks = module.steps.flatMap(s => s.tasks);
    const completed = allTasks.filter(t => taskState[t.id]).length;
    return { completed, total: allTasks.length };
  };

  const totalTasks = modules.flatMap(m => m.steps.flatMap(s => s.tasks)).length;
  const completedTasks = Object.values(taskState).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 animate-fade-in">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              📚 Panduan Kerja Harian
            </h1>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Semua solusi untuk trouble yang sering terjadi di tempat kerja. 
              Tinggal cari masalahnya, ikuti langkah-langkahnya. 
              <span className="font-semibold"> Nggak perlu panik atau nunggu senior!</span>
            </p>
            
            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{modules.length}</div>
                <div className="text-sm text-white/80">Panduan</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{totalTasks}</div>
                <div className="text-sm text-white/80">Langkah</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{completedTasks}</div>
                <div className="text-sm text-white/80">Sudah Dicoba</div>
              </div>
            </div>

            {/* Tools Link */}
            <div className="mt-6">
              <Link
                href="/tools/qr-generator"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all border border-white/30"
              >
                🔲 QR Code Generator
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter & Add Button */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="🔍  Lagi ada trouble apa? Ketik di sini..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-all text-lg"
              />
            </div>
            <button
              onClick={() => {
                setEditingModule(null);
                setShowForm(true);
              }}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span className="hidden sm:inline">Tambah Panduan</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {cat === 'all' ? '🚨 Semua' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse-slow">⏳</div>
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module, index) => {
                const { completed, total } = getModuleProgress(module.id);
                return (
                  <div
                    key={module.id}
                    className="animate-fade-in relative group"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(module);
                        }}
                        className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(module.id);
                        }}
                        className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <ModuleCard
                      module={module}
                      progress={completed}
                      totalTasks={total}
                      completedTasks={completed}
                    />
                  </div>
                );
              })}
            </div>

            {filteredModules.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  {modules.length === 0 ? 'Belum Ada Panduan' : 'Tidak Ditemukan'}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {modules.length === 0 
                    ? 'Klik tombol "Tambah Panduan" untuk mulai buat panduan pertama kamu!'
                    : 'Coba ubah kata kunci pencarian atau filter'}
                </p>
                {modules.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all"
                  >
                    ➕ Tambah Panduan Pertama
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ModuleForm
          module={editingModule}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingModule(null);
          }}
        />
      )}
    </div>
  );
}
