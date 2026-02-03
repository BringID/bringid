import { TTaskCheck } from './task-check'

export type TTaskGroup = {
  points: number
  semaphoreGroupId: string
  credentialGroupId: string
  checks: TTaskCheck[]
}
