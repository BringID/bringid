import { TVerification } from '@/types';
import { Task } from '../../../../core';

type TProps = {
  tasks: Task[];
  verifications: TVerification[];
  onAddVerifications: () => void;
  className?: string;
  devMode: boolean
};

export default TProps;
