import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TrainingCategory } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import styles from "./studentCategoryPopup.module.css";

interface StudentCategoryPopupProps {
    studentName: string;
    categoryPoints: Array<{category: string; points: number}>;
    allCategories: TrainingCategory[];
}

function StudenCategoryPopup({studentName, categoryPoints, allCategories} : StudentCategoryPopupProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={styles.triggerButton}>
                    View
                    <ChevronDown className={styles.chevron} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={styles.content}>
                <DropdownMenuLabel className={styles.label}>
                    {studentName} - Category Wise Points
                </DropdownMenuLabel>

                <DropdownMenuSeparator/>

                <div className={styles.categoryList}> 
                    {allCategories.map((category: TrainingCategory) => {
                        const found = categoryPoints.find(
                            (item) => item.category === category.category_name
                        );
                        return (
                            <div key={category.category_id} className={styles.categoryItem}>
                                <span className={styles.categoryName}> {category.category_name} </span>
                                <strong className={styles.points}> {found?.points || 0} </strong>
                            </div>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default StudenCategoryPopup;