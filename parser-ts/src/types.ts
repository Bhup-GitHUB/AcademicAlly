export type ClassType = 'L' | 'T' | 'P';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ClassDetails {
    subjectCode: string;
    room: string;
    subjectName?: string;
    classType?: 'Lecture' | 'Tutorial' | 'Practical';
}

export type TimeSlot = [string, string, string, string];

export interface DaySchedule {
    [time: string]: TimeSlot;
}

export interface SubgroupSchedule {
    [day: string]: DaySchedule;
}

export interface TimetableData {
    [subgroup: string]: SubgroupSchedule;
}

export interface SubjectMap {
    [code: string]: string;
}

export interface MergedCellsMap {
    [cellAddress: string]: [number, number];
}

export interface SubgroupMap {
    [key: string]: string;
}


