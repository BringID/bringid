import { TSemaphoreProof } from "@/types";

type TProps = {
  pointsRequired: number;
  dropAddress: string;
  onClose: () => void;
  points: number;
  onAccept: (
    proofs: TSemaphoreProof[]
  ) => void
};

export default TProps;
