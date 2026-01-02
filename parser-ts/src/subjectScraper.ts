import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';
import { TimetableData, SubjectMap } from './types';

async function getCourseName(courseCode: string): Promise<string> {
    try {
        const url = 'https://cl.thapar.edu/view1.php';
        const formData = new URLSearchParams({
            ccode: courseCode,
            submit: ''
        });

        console.log(`Sending POST request for course code ${courseCode}...`);

        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });

        console.log('POST request sent. Status code:', response.status);

        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            const rows = $('tr');
            
            if (rows.length >= 3) {
                const thirdRow = rows.eq(2);
                const cells = thirdRow.find('td');
                
                if (cells.length >= 2) {
                    const courseName = cells.eq(1).text().trim();
                    console.log('Course Name:', courseName);
                    return courseName;
                }
            }
            
            console.log('Failed to parse course name');
            return courseCode;
        } else {
            console.log('Failed to retrieve the webpage');
            return courseCode;
        }
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        return courseCode;
    }
}

function extractCourseCodes(jsonData: TimetableData): { courseCodes: Set<string>, skipped: Set<string> } {
    const courseCodes = new Set<string>();
    const skipped = new Set<string>();

    const patternCourse = /U[A-Z]{2,3}\d{3}/;
    const patternNumeric = /^(\d{3})([LTP]?)$/;

    for (const section in jsonData) {
        const schedule = jsonData[section];
        for (const day in schedule) {
            const times = schedule[day];
            for (const time in times) {
                const details = times[time];
                const courseField = details[0];

                const codes = courseField.split('/');
                for (let code of codes) {
                    code = code.trim().toUpperCase();
                    code = code.replace(/\(.*?\)/g, '').trim();

                    let matched = false;

                    const courseMatch = code.match(patternCourse);
                    if (courseMatch) {
                        courseCodes.add(courseMatch[0]);
                        matched = true;
                    }

                    const numericMatch = code.match(patternNumeric);
                    if (numericMatch) {
                        courseCodes.add(numericMatch[1]);
                        matched = true;
                    }

                    if (!matched) {
                        const subjectCode = code.length > 1 && ['L', 'T', 'P'].includes(code[code.length - 1])
                            ? code.slice(0, -1)
                            : code;
                        courseCodes.add(subjectCode);
                        skipped.add(subjectCode);
                    }
                }
            }
        }
    }

    return { courseCodes, skipped };
}

async function main() {
    const filePath = path.join(__dirname, '../../parser-ts/output/resultsTIMETABLEJANTOMAY26.json');
    const outputPath = path.join(__dirname, '../../parser-ts/output/subjects.json');

    console.log('Reading timetable data...');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData: TimetableData = JSON.parse(fileContent);

    console.log('Extracting course codes...');
    const { courseCodes, skipped } = extractCourseCodes(jsonData);

    const courses: SubjectMap = {};

    console.log('Fetching course names...');
    for (const code of courseCodes) {
        const courseName = await getCourseName(code);
        courses[code] = courseName;
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Writing subjects file...');
    await fs.writeFile(outputPath, JSON.stringify(courses, null, 4));

    console.log('Skipped:', Array.from(skipped));
    console.log('Course Codes:', Array.from(courseCodes));
    console.log(`Successfully created: ${outputPath}`);
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});


