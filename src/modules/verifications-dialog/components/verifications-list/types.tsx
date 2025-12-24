import { TVerification } from '@/types';
import { Task } from '../../../../core';

type TProps = {
  tasks: Task[];
  verifications: TVerification[];
  className?: string;
  devMode: boolean
};

export default TProps;
