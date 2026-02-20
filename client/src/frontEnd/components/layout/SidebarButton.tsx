import styles from "./sidebar.module.css";

type SidebarButtonProps = {
  label: string;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

function SidebarButton({ label, active = false, onClick }: SidebarButtonProps) {
  return (
    <button
      className={`${styles.navButton} ${active ? styles.navButtonActive : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default SidebarButton;
