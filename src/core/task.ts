import { TNotarizationGroup } from '@/types';

export type Task = {
  id: string;
  title: string;
  description?: string;
  icon: string;
  groups: TNotarizationGroup[];
  service: string;
  oauthUrl: string | undefined
};

function loadTasks(
  devMode: boolean
): Task[] {
  try {
    const tasksConfig = devMode ? require('../configs/tasks-sepolia.json') : require('../configs/tasks.json');

    // Validate that it's an array
    if (!Array.isArray(tasksConfig)) {
      console.error('Tasks config is not an array');
      return [];
    }

    // Parse and validate each task
    return tasksConfig.map((task): Task => {
      // Ensure required fields are present
      if (typeof task.title !== 'string' || !task.groups) {
        console.warn('Invalid task format:', task);
        throw new Error('Invalid task format');
      }

      return {
        title: task.title,
        oauthUrl: task.oauthUrl,
        id: task.id,
        description: task.description,
        icon: task.icon,
        groups: task.groups,
        service: task.service
      };
    });
  } catch (error) {
    console.error('Failed to parse tasks config:', error);
    return [];
  }
}

export function tasks(
  devMode: boolean
): Task[] {
  const TASKS = loadTasks(devMode);
  return [...TASKS];
}
