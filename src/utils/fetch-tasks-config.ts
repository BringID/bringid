import { TMode, TTasksConfig, TCredentialGroupPointsMap } from '@/types'
import api from './api'

async function fetchTasksConfig(mode: TMode): Promise<TCredentialGroupPointsMap | null> {
  try {
    const tasksFileName = mode === 'dev' ? 'tasks-sepolia' : 'tasks'
    const tasks = await api<TTasksConfig>(
      `https://raw.githubusercontent.com/BringID/configs/main/${tasksFileName}.json`
    )

    const pointsMap: TCredentialGroupPointsMap = new Map()
    for (const task of tasks) {
      for (const group of task.groups) {
        pointsMap.set(group.credentialGroupId, group.points)
      }
    }

    return pointsMap
  } catch (err) {
    console.error(err)
    return null
  }
}

export default fetchTasksConfig
