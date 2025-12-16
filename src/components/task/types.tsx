import { TTaskGroup, TVerificationStatus } from '@/types';

export type TProps = {
  icon?: string;
  title: string;
  description?: string;
  status: TVerificationStatus;
  groups: TTaskGroup[];
  id: string;
  userKey: string;
};
