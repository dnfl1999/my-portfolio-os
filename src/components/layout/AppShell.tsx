import { PropsWithChildren, ReactNode } from "react";

interface AppShellProps extends PropsWithChildren {
  sidebar: ReactNode;
  mobileTabs: ReactNode;
  title: string;
  subtitle: string;
}

export function AppShell({
  sidebar,
  mobileTabs,
  title,
  subtitle,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar-panel">{sidebar}</aside>
      <div className="main-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">My Portfolio OS</p>
            <h1>{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <div className="mobile-tabs-wrapper">{mobileTabs}</div>
      </div>
    </div>
  );
}
