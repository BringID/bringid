import { TSemaphoreProof } from "@/types";

type TProps = {
  pointsRequired: number;
  scope: string | null;
  onClose: () => void;
  points: number;
  onAccept: (
    proofs: TSemaphoreProof[]
  ) => void
};

export default TProps;
