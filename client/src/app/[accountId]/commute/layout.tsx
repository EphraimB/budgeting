import CommutePanels from "../../../../components/commute/CommutePanels";
import { CommuteSystem } from "@/app/types/types";

async function CommuteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommutePanels>{children}</CommutePanels>
      {children}
    </>
  );
}

export default CommuteLayout;
