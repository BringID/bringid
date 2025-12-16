import { TVerification } from '@/types';
import { Task } from '../../../../core';

type TProps = {
  className?: string;
  tasks: Task[];
  verifications: TVerification[];
  selected: string[];
  onSelect: (id: string, selected: boolean) => void;
  devMode: boolean
};

export default TProps;
