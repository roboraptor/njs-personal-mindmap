import SettingsSidebar from '@/components/SettingsSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-fluid">
      <h2 className="fw-bold">⚙️ Settings</h2>
      <div className="row">
        <div className="col-md-3 col-lg-2 p-0">
          <SettingsSidebar />
        </div>
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}
