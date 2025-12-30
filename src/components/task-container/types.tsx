import React from 'react'
import { TTask, TVerificationStatus } from '@/types'

type TProps = {
  status: TVerificationStatus;
  children: React.ReactNode | React.ReactNode[];
  task: TTask
  selectable: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  
};

export default TProps;
