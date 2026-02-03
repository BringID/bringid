import { TTaskGroup } from './task-group'

export type TTask = {
  title: string
  id: string
  service: string
  description: string
  icon: string
  verificationType?: string
  verificationUrl?: string
  oauthUrl?: string
  groups: TTaskGroup[]
}
