"use client";

import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import type { Module as ModuleType } from '@/lib/modules';
import Link from 'next/link';

interface ModuleCardProps {
  module: ModuleType;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export function ModuleCard({ module, progress, totalTasks, completedTasks }: ModuleCardProps) {
  return (
    <Link 
      href={`/modules/${module.id}`}
      className="group block"
    >
      <div className="relative h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 hover:-translate-y-1 overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
          {module.icon}
        </div>
        
        {/* Category Badge */}
        <Badge variant="info" className="mb-2">
          {module.category}
        </Badge>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {module.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
          {module.description}
        </p>
        
        {/* Difficulty */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant={
              module.difficulty === 'Beginner' ? 'success' :
              module.difficulty === 'Intermediate' ? 'warning' : 'default'
            }
          >
            {module.difficulty}
          </Badge>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {module.steps.length} langkah
          </span>
        </div>
        
        {/* Progress */}
        <ProgressBar value={completedTasks} max={totalTasks} />
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
          {completedTasks}/{totalTasks} tugas selesai
        </p>
      </div>
    </Link>
  );
}
