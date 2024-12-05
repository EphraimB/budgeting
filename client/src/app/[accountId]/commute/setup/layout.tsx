import StatusBar from "../../../../../components/commute/StatusBar";

async function CommuteSetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StatusBar title="Setup" />
      <br />
      {children}
    </>
  );
}

export default CommuteSetupLayout;
