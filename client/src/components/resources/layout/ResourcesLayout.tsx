import { type ReactNode } from "react";
import styles from "../resources.module.css";

interface ResourcesLayoutProps {
  children: ReactNode;
}

function ResourcesLayout({ children }: ResourcesLayoutProps) {
  return <div className={styles.mainContent}>{children}</div>;
}

export default ResourcesLayout;