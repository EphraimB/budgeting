import CommutePanels from "../../../../components/commute/CommutePanels";

async function CommuteLayout({ children }: { children: React.ReactNode }) {
  return <CommutePanels>{children}</CommutePanels>;
}

export default CommuteLayout;
