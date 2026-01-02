import { promises as fs } from 'fs';
import path from 'path';
import { TimetableData, SubjectMap, SubgroupSchedule, DaySchedule, TimeSlot } from './types';

function updateSchedule(schedule: SubgroupSchedule, subjects: SubjectMap): SubgroupSchedule {
    for (const day in schedule) {
        const daySchedule: DaySchedule = schedule[day];
        
        for (const time in daySchedule) {
            const details = daySchedule[time] as any[];
            const subjectCodes = details[0].split('/');
            const subjectNames: string[] = [];

            for (const code of subjectCodes) {
                const subjectCode = ['L', 'T', 'P'].includes(code[code.length - 1])
                    ? code.slice(0, -1)
                    : code;
                
                if (subjectCode in subjects) {
                    subjectNames.push(subjects[subjectCode]);
                } else {
                    subjectNames.push(subjectCode);
                }
            }

            if (subjectNames.length > 0) {
                details.push(subjectNames.join('/'));
            }

            const type = details[0][details[0].length - 1];
            if (type === 'L') {
                details.push('Lecture');
            } else if (type === 'T') {
                details.push('Tutorial');
            } else if (type === 'P') {
                details.push('Practical');
            }
        }
    }
    
    return schedule;
}

async function addSubjectNames() {
    const resultPath = path.join(__dirname, '../../parser-ts/output/resultsTIMETABLEJULYTODEC25.json');
    const subjectPath = path.join(__dirname, '../../parser-ts/output/subjects.json');

    console.log('Reading timetable data...');
    const resultContent = await fs.readFile(resultPath, 'utf-8');
    const data: TimetableData = JSON.parse(resultContent);

    console.log('Reading subjects data...');
    const subjectContent = await fs.readFile(subjectPath, 'utf-8');
    const subjects: SubjectMap = JSON.parse(subjectContent);

    console.log('Updating schedules with subject names...');
    for (const subgroup in data) {
        data[subgroup] = updateSchedule(data[subgroup], subjects);
    }

    console.log('Writing enriched data...');
    await fs.writeFile(resultPath, JSON.stringify(data, null, 4));

    console.log(`Successfully updated: ${resultPath}`);
}

addSubjectNames().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});


