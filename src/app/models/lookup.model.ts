export interface CourseType {
    courseTypeId: number;
    name: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
}

export interface Level {
    levelId: number;
    name: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
}
