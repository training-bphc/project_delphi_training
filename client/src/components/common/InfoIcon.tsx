import React from "react";
import styles from "./InfoIcon.module.css";

/**
 * InfoIcon component displays an 'i' icon in the top right corner.
 * On hover, it shows a tooltip with information.
 * Edit the tooltip content in the InfoIcon.tsx file as needed.
 */
const InfoIcon: React.FC = () => {
  return (
    <div className={styles.infoIconContainer}>
      <span className={styles.infoIcon}>i</span>
      <div className={styles.tooltip}>
        {/* Edit this content with your information */}
        <strong>Project Website Info</strong>
        <ul>
          <li>
            The marking is done as follows. (These are just random place holder
            numbers)
          </li>
          <li>+ = Attendence; - = No show; 0 = Not registered or did not do</li>
          <li>
            <span>Hackathon</span> <span>+5 or -2.5 or 0</span>
          </li>
          <li>
            <span>Lecture Session</span> <span>+7 or -3.5 or 0</span>
          </li>
          <li>
            <span>Workshop</span> <span> +3 or -1.5 or 0</span>
          </li>
          <li>
            <span>Seminar</span> <span> +6 or -3 or 0</span>
          </li>
          <li>
            <span>Categoty 5</span> <span> +4 or -2 or 0</span>
          </li>
          <li>
            <span>Categoty 6</span> <span> +9 or -4.5 or 0</span>
          </li>
          <li>
            <span>Categoty 7</span> <span> +15 or -7.5 or 0</span>
          </li>
          <li>
            <span>Categoty 8</span> <span> +14 or -7 or 0</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InfoIcon;
