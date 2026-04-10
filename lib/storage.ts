import { supabase } from '@/lib/supabase';
import type { Module } from '@/lib/modules';

const TASK_STATE_KEY = 'module-task-state';
const LAST_VISITED_DATE_KEY = 'last-visited-date';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function checkAndResetDaily() {
  if (typeof window === 'undefined') return;

  const today = getToday();
  const lastVisited = localStorage.getItem(LAST_VISITED_DATE_KEY);

  if (lastVisited !== today) {
    // New day - reset all task progress in Supabase
    resetAllTaskStates();
    localStorage.setItem(LAST_VISITED_DATE_KEY, today);
  }
}

function getTaskStateKey(): string {
  const today = getToday();
  return `task-states-${today}`;
}

function getLocalTaskState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(TASK_STATE_KEY);
  return data ? JSON.parse(data) : {};
}

function setLocalTaskState(state: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASK_STATE_KEY, JSON.stringify(state));
}

async function resetAllTaskStates() {
  if (typeof window === 'undefined') return;
  
  // Clear local storage
  localStorage.setItem(TASK_STATE_KEY, '{}');
  
  // Clear today's completion records in Supabase
  const today = getToday();
  await supabase
    .from('task_states')
    .delete()
    .eq('completed_at', today);
}

export async function getCustomModules(): Promise<Module[]> {
  try {
    console.log('Fetching modules from Supabase...');
    
    const { data, error } = await supabase
      .from('modules')
      .select(`
        *,
        steps (
          *,
          tasks (
            *
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching modules:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      // Fallback to localStorage if Supabase fails
      return getModulesFromLocalStorage();
    }

    console.log(`Fetched ${data?.length || 0} modules from Supabase`);

    // Transform the nested data into the Module interface
    const modules: Module[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      icon: row.icon,
      color: row.color,
      difficulty: row.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      steps: (row.steps || []).sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        tip: step.tip,
        tasks: (step.tasks || []).sort((a: any, b: any) => a.task_order - b.task_order).map((task: any) => ({
          id: task.id,
          label: task.label,
          completed: false, // Will be updated from task_states
        })),
      })),
    }));

    // Update task completion status
    const taskState = getLocalTaskState();
    for (const module of modules) {
      for (const step of module.steps) {
        for (const task of step.tasks) {
          task.completed = taskState[task.id] || false;
        }
      }
    }

    return modules;
  } catch (err: any) {
    console.error('Failed to get modules:', err);
    return getModulesFromLocalStorage();
  }
}

function getModulesFromLocalStorage(): Module[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('custom-modules');
  return data ? JSON.parse(data) : [];
}

export async function saveModules(modules: Module[]): Promise<void> {
  // This is now handled by addModule/updateModule individually
  // Keep for backwards compatibility
  if (typeof window !== 'undefined') {
    localStorage.setItem('custom-modules', JSON.stringify(modules));
  }
}

export async function addModule(module: Module): Promise<Module[]> {
  try {
    console.log('Adding module to Supabase:', module.title);
    
    // Insert module
    const moduleId = module.id || crypto.randomUUID();
    
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .insert({
        id: moduleId,
        title: module.title,
        description: module.description,
        category: module.category,
        icon: module.icon,
        color: module.color,
        difficulty: module.difficulty,
      })
      .select()
      .single();

    if (moduleError) {
      console.error('Module insert error:', moduleError);
      throw moduleError;
    }

    console.log('Module inserted:', moduleData.id);

    // Insert steps and tasks
    for (let stepIdx = 0; stepIdx < module.steps.length; stepIdx++) {
      const step = module.steps[stepIdx];
      const stepId = step.id || crypto.randomUUID();
      
      const { data: stepData, error: stepError } = await supabase
        .from('steps')
        .insert({
          id: stepId,
          module_id: moduleData.id,
          title: step.title,
          description: step.description,
          tip: step.tip,
          step_order: stepIdx,
        })
        .select()
        .single();

      if (stepError) {
        console.error('Step insert error:', stepError);
        throw stepError;
      }

      console.log('Step inserted:', stepData.id);

      // Insert tasks for this step
      for (let taskIdx = 0; taskIdx < step.tasks.length; taskIdx++) {
        const task = step.tasks[taskIdx];
        const taskId = task.id || crypto.randomUUID();
        
        const { error: taskError } = await supabase
          .from('tasks')
          .insert({
            id: taskId,
            step_id: stepData.id,
            label: task.label,
            task_order: taskIdx,
          });

        if (taskError) {
          console.error('Task insert error:', taskError);
          throw taskError;
        }
      }
    }

    console.log('All steps and tasks inserted successfully');

    // Fetch updated modules from Supabase
    const modules = await getCustomModules();
    return modules;
  } catch (err: any) {
    console.error('Error adding module:', err);
    console.error('Error details:', err?.message, err?.details, err?.hint);
    
    // Fallback to localStorage
    console.warn('Falling back to localStorage');
    const modules = await getModulesFromLocalStorage();
    const moduleId = module.id || crypto.randomUUID();
    const updated = [...modules, { ...module, id: moduleId }];
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom-modules', JSON.stringify(updated));
    }
    return updated;
  }
}

export async function updateModule(id: string, updated: Module): Promise<Module[]> {
  try {
    // Update module
    const { error: moduleError } = await supabase
      .from('modules')
      .update({
        title: updated.title,
        description: updated.description,
        category: updated.category,
        icon: updated.icon,
        color: updated.color,
        difficulty: updated.difficulty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (moduleError) throw moduleError;

    // Delete existing steps and tasks
    const { data: existingSteps } = await supabase
      .from('steps')
      .select('id')
      .eq('module_id', id);

    if (existingSteps) {
      const stepIds = existingSteps.map(s => s.id);
      if (stepIds.length > 0) {
        await supabase.from('tasks').delete().in('step_id', stepIds);
        await supabase.from('steps').delete().in('id', stepIds);
      }
    }

    // Insert new steps and tasks
    for (let stepIdx = 0; stepIdx < updated.steps.length; stepIdx++) {
      const step = updated.steps[stepIdx];
      
      const { data: stepData, error: stepError } = await supabase
        .from('steps')
        .insert({
          id: step.id,
          module_id: id,
          title: step.title,
          description: step.description,
          tip: step.tip,
          step_order: stepIdx,
        })
        .select()
        .single();

      if (stepError) throw stepError;

      // Insert tasks for this step
      for (let taskIdx = 0; taskIdx < step.tasks.length; taskIdx++) {
        const task = step.tasks[taskIdx];
        
        await supabase
          .from('tasks')
          .insert({
            id: task.id,
            step_id: step.id,
            label: task.label,
            task_order: taskIdx,
          });
      }
    }

    // Also save to localStorage for backwards compatibility
    const modules = await getCustomModules();
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom-modules', JSON.stringify(modules));
    }

    return modules;
  } catch (err) {
    console.error('Error updating module:', err);
    // Fallback to localStorage
    const modules = await getModulesFromLocalStorage();
    const updatedModules = modules.map(m => m.id === id ? updated : m);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom-modules', JSON.stringify(updatedModules));
    }
    return updatedModules;
  }
}

export async function deleteModule(id: string): Promise<Module[]> {
  try {
    // Delete from Supabase (cascade will handle steps, tasks, and task_states)
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Clean up local task state
    if (typeof window !== 'undefined') {
      const taskState = getLocalTaskState();
      const module = await getCustomModules().then(mods => mods.find(m => m.id === id));
      if (module) {
        const taskIds = module.steps.flatMap(s => s.tasks.map(t => t.id));
        taskIds.forEach(tid => delete taskState[tid]);
        setLocalTaskState(taskState);
      }
    }

    const modules = await getCustomModules();
    return modules;
  } catch (err) {
    console.error('Error deleting module:', err);
    // Fallback to localStorage
    const modules = await getModulesFromLocalStorage();
    const filtered = modules.filter(m => m.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom-modules', JSON.stringify(filtered));
    }
    
    // Also clean task state for this module's tasks
    if (typeof window !== 'undefined') {
      const taskState = JSON.parse(localStorage.getItem(TASK_STATE_KEY) || '{}');
      const module = modules.find(m => m.id === id);
      if (module) {
        const taskIds = module.steps.flatMap(s => s.tasks.map(t => t.id));
        taskIds.forEach(tid => delete taskState[tid]);
        localStorage.setItem(TASK_STATE_KEY, JSON.stringify(taskState));
      }
    }

    return filtered;
  }
}

export async function getAllModules(): Promise<Module[]> {
  checkAndResetDaily();
  const custom = await getCustomModules();
  return custom;
}

export async function getCompleteModules(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('module_completions')
      .select('module_id')
      .eq('completed', true);

    if (error) throw error;

    return new Set((data || []).map(row => row.module_id));
  } catch (err) {
    console.error('Error getting complete modules:', err);
    // Fallback to localStorage
    if (typeof window === 'undefined') return new Set();
    const data = localStorage.getItem('complete-modules');
    return data ? new Set(JSON.parse(data)) : new Set();
  }
}

export async function saveCompleteModules(moduleIds: Set<string>): Promise<void> {
  try {
    // Clear existing completions
    await supabase.from('module_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new completions
    for (const moduleId of moduleIds) {
      await supabase
        .from('module_completions')
        .upsert({ module_id: moduleId, completed: true });
    }

    // Also save to localStorage for fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('complete-modules', JSON.stringify(Array.from(moduleIds)));
    }
  } catch (err) {
    console.error('Error saving complete modules:', err);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('complete-modules', JSON.stringify(Array.from(moduleIds)));
    }
  }
}

export async function toggleCompleteModule(moduleId: string): Promise<boolean> {
  const complete = await getCompleteModules();
  
  if (complete.has(moduleId)) {
    complete.delete(moduleId);
    // Remove from Supabase
    await supabase
      .from('module_completions')
      .delete()
      .eq('module_id', moduleId);
  } else {
    complete.add(moduleId);
    // Add to Supabase
    await supabase
      .from('module_completions')
      .upsert({ module_id: moduleId, completed: true });
  }
  
  await saveCompleteModules(complete);
  return complete.has(moduleId);
}

// Task state management
export async function getTaskState(): Promise<Record<string, boolean>> {
  checkAndResetDaily();
  return getLocalTaskState();
}

export async function updateTaskState(taskId: string, completed: boolean): Promise<void> {
  const taskState = getLocalTaskState();
  taskState[taskId] = completed;
  setLocalTaskState(taskState);

  // Also save to Supabase for persistence
  try {
    const today = getToday();
    
    if (completed) {
      await supabase
        .from('task_states')
        .upsert({ task_id: taskId, completed: true, completed_at: today });
    } else {
      await supabase
        .from('task_states')
        .delete()
        .eq('task_id', taskId)
        .eq('completed_at', today);
    }
  } catch (err) {
    console.error('Error updating task state in Supabase:', err);
  }
}
