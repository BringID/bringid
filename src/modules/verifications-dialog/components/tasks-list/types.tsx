import { Task } from '../../../../core';
import { TVerification } from '@/types';

type TProps = {
  tasks: Task[];
  className?: string;
  verifications: TVerification[];
};

export default TProps;
