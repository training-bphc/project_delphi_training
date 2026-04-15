import { ReactNode } from "react";

interface ResourcesLayoutProps {
  children: ReactNode;
}

function ResourcesLayout({ children }: ResourcesLayoutProps) {
  return <>{children}</>;
}

export default ResourcesLayout;