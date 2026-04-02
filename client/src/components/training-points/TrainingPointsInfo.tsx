import styles from "./TrainingPointsInfo.module.css";
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

interface TrainingPointsInfoProps {
  onClose: () => void;
}

const faqItems: FAQItem[] = [
  {
    question: "What are Training Points used for?",
    answer: "Training Points are gained by participating in Training Activities which help in showcasing one's growth through the Training Activities and in turn help with Placement Points."
  },
  {
    question: "How can I earn Training Points?",
    answer: "One can earn Training Points by participating in the Training Activities conducted by the Training Unit throughout the year."
  },
  {
    question: "What are Placement Points used for?",
    answer: "Placement points reflect the regularity of the student in the placement drive."
  }
]

function TrainingPointsInfo({ onClose }: TrainingPointsInfoProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  
  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <CardTitle>Training Points FAQ</CardTitle>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </CardHeader>
          <CardContent className={styles.content}>
            <div className={styles.faqList}>
              {faqItems.map((item, index) => (
                <div key={index} className={styles.faqItem}>
                  <button className={styles.faqQuestion}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={expandedIndex === index}>
                    <span> {item.question} </span>
                    <span className={styles.icon}> {expandedIndex === index ? "-" : "+"} </span>
                  </button>
                  {expandedIndex === index && (
                    <div className={styles.faqAnswer}> {item.answer} </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card> 
      </div>
    </div>
  )
}

export default TrainingPointsInfo;
