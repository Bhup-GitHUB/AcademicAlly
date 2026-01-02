import ExcelJS from 'exceljs';
import { TimetableData, MergedCellsMap, ClassType } from './types';

export function getMergedCells(worksheet: ExcelJS.Worksheet): MergedCellsMap {
    const mergedCellsMap: MergedCellsMap = {};
    
    const merges = (worksheet as any)._merges || {};
    Object.values(merges).forEach((range: any) => {
        if (!range) return;
        
        let rangeStr = '';
        if (typeof range === 'string') {
            rangeStr = range;
        } else if (range.model) {
            rangeStr = range.model;
        } else if (range.tl && range.br) {
            rangeStr = `${range.tl.address}:${range.br.address}`;
        }
        
        if (!rangeStr || typeof rangeStr !== 'string') return;
        
        const match = rangeStr.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
        if (match) {
            const minCol = columnLetterToNumber(match[1]);
            const minRow = parseInt(match[2]);
            const maxCol = columnLetterToNumber(match[3]);
            const topLeftCell = `${match[1]}${minRow}`;
            mergedCellsMap[topLeftCell] = [minCol, maxCol];
        }
    });
    
    return mergedCellsMap;
}

export function columnLetterToNumber(letter: string): number {
    let column = 0;
    for (let i = 0; i < letter.length; i++) {
        column = column * 26 + letter.charCodeAt(i) - 64;
    }
    return column;
}

export function getColumnLetter(column: number): string {
    let letter = '';
    while (column > 0) {
        const remainder = (column - 1) % 26;
        letter = String.fromCharCode(65 + remainder) + letter;
        column = Math.floor((column - 1) / 26);
    }
    return letter;
}

export function removeWhitespace(s: string | null | undefined): string | null {
    if (s === null || s === undefined) {
        return null;
    }
    return s.toString().replace(/\s+/g, '');
}

export function returnDay(rowVal: number): string | null {
    if (rowVal >= 8 && rowVal <= 35) return "Monday";
    if (rowVal >= 36 && rowVal <= 63) return "Tuesday";
    if (rowVal >= 64 && rowVal <= 91) return "Wednesday";
    if (rowVal >= 92 && rowVal <= 119) return "Thursday";
    if (rowVal >= 120 && rowVal <= 147) return "Friday";
    if (rowVal >= 148 && rowVal <= 175) return "Saturday";
    return null;
}

export function getTypeOfClass(s: string): ClassType | null {
    for (let i = s.length - 1; i >= 0; i--) {
        if (s[i] !== ' ') {
            return s[i] as ClassType;
        }
    }
    return null;
}

export function getSubjectName(subjectCode: string, subjectMap: { [key: string]: string }): string {
    // Remove the L/T/P suffix to get the base code
    const baseCode = ['L', 'T', 'P'].includes(subjectCode[subjectCode.length - 1])
        ? subjectCode.slice(0, -1)
        : subjectCode;
    
    // Return the subject name from the map, or the base code if not found
    return subjectMap[baseCode] || baseCode;
}

export function getClassTypeName(type: ClassType | null): string {
    if (type === 'L') return 'Lecture';
    if (type === 'T') return 'Tutorial';
    if (type === 'P') return 'Practical';
    return '';
}

export function getFormattedTime(worksheet: ExcelJS.Worksheet, row: number, column: number): string {
    const cell = worksheet.getCell(row, column);
    let cellValue = cell.value;

    if (cellValue instanceof Date) {
        const hours = cellValue.getUTCHours();
        const minutes = cellValue.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${ampm}`;
    }

    if (typeof cellValue === 'number') {
        const totalMinutes = Math.round(cellValue * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${ampm}`;
    }

    if (typeof cellValue === 'object' && cellValue !== null && 'text' in cellValue) {
        return (cellValue as any).text.toString().trim();
    }

    if (typeof cellValue === 'string') {
        return cellValue.trim();
    }

    return cellValue?.toString().trim() || '';
}

export function handlePractical(
    worksheet: ExcelJS.Worksheet,
    x: number,
    y: number,
    subgroup: string,
    day: string,
    time: string,
    cell: string,
    result: TimetableData,
    room: string,
    subjectMap: { [key: string]: string }
): void {
    const subjectName = getSubjectName(cell, subjectMap);
    const classType = getClassTypeName('P');
    result[subgroup][day][time] = [cell, room, subjectName, classType];
    console.log(`result[${subgroup}][${day}][${time}] = ${cell}`);

    const time2 = getFormattedTime(worksheet, x + 2, 4);
    result[subgroup][day][time2] = [cell, room, subjectName, classType];
    console.log(`result[${subgroup}][${day}][${time2}] = ${cell}`);
}

export function handleTutorial(
    worksheet: ExcelJS.Worksheet,
    x: number,
    y: number,
    subgroup: string,
    day: string,
    time: string,
    cell: string,
    result: TimetableData,
    room: string,
    subjectMap: { [key: string]: string }
): number | null {
    const subjectName = getSubjectName(cell, subjectMap);
    const classType = getClassTypeName('T');
    let tVal: number | null = null;
    const checker = worksheet.getCell(x + 2, y).value?.toString();
    
    if (checker && checker.length <= 5) {
        const time2 = getFormattedTime(worksheet, x + 2, 4);
        result[subgroup][day][time2] = [cell, room, subjectName, classType];
        console.log(`result[${subgroup}][${day}][${time2}] = ${cell}`);
        tVal = 1;
    }

    result[subgroup][day][time] = [cell, room, subjectName, classType];
    console.log(`result[${subgroup}][${day}][${time}] = ${cell}`);
    return tVal;
}

export function countMergedCellsAlongRow(mergedCellsMap: MergedCellsMap, cellAddress: string): number {
    if (cellAddress in mergedCellsMap) {
        const [minCol, maxCol] = mergedCellsMap[cellAddress];
        return maxCol - minCol + 1;
    }
    return 1;
}

export function handleLecture(
    worksheet: ExcelJS.Worksheet,
    x: number,
    y: number,
    subgroup: string,
    day: string,
    time: string,
    cell: string,
    result: TimetableData,
    mergedCellsMap: MergedCellsMap,
    room: string,
    subjectMap: { [key: string]: string }
): number | null {
    const lectureGroup = worksheet.getCell(4, y).value;
    console.log(`lectureGroup: ${lectureGroup}`);
    
    const subjectName = getSubjectName(cell, subjectMap);
    const classType = getClassTypeName('L');
    result[subgroup][day][time] = [cell, room, subjectName, classType];
    console.log(`result[${subgroup}][${day}][${time}] = ${cell}`);
    
    let tVal: number | null = null;
    const checker = worksheet.getCell(x + 2, y).value?.toString();
    
    if (checker && checker.length <= 5) {
        const time2 = getFormattedTime(worksheet, x + 2, 4);
        result[subgroup][day][time2] = [cell, room, subjectName, classType];
        console.log(`result[${subgroup}][${day}][${time2}] = ${cell}`);
        tVal = 1;
    }
    
    return tVal;
}

export function parser(worksheet: ExcelJS.Worksheet, result: TimetableData, subjectMap: { [key: string]: string } = {}): void {
    const mergedCellsMap = getMergedCells(worksheet);
    const rowSize = worksheet.rowCount;
    const colSize = worksheet.columnCount;

    // Detect the starting row for class data (check if data starts on odd or even rows)
    let startRow = 8; // Default
    let foundDataRow = false;
    
    // Search for the first row with class data (code ending in L, T, or P)
    // Start from row 8 since rows 5-7 are headers
    for (let r = 8; r <= 20 && !foundDataRow; r++) {
        for (let c = 5; c <= Math.min(colSize, 30); c++) {
            const cellValue = worksheet.getCell(r, c).value?.toString();
            if (cellValue) {
                const type = getTypeOfClass(cellValue);
                if (type === 'L' || type === 'T' || type === 'P') {
                    startRow = r;
                    foundDataRow = true;
                    console.log(`Detected data starting row: ${startRow} (found ${cellValue} at row ${r}, col ${c})`);
                    break;
                }
            }
        }
    }

    let skipNext = false;

    for (let y = 5; y <= colSize; y += 2) {
        for (let x = startRow; x <= rowSize; x += 2) {
            if (skipNext) {
                skipNext = false;
                continue;
            }

            const subgroup = removeWhitespace(worksheet.getCell(5, y).value?.toString());
            if (!subgroup) continue;

            const day = returnDay(x);
            if (!day) break;

            const time = getFormattedTime(worksheet, x, 4);
            const cellAddress = `${getColumnLetter(y)}${x}`;
            console.log(cellAddress);
            console.log(worksheet.name);

            const cell = removeWhitespace(worksheet.getCell(x, y).value?.toString());
            console.log(worksheet.getCell(x, y).value);
            console.log(`Processing cell at row=${x}, column=${y} | subgroup: ${subgroup} | time: ${time} | day: ${day} | cell value: ${cell}`);

            if (cell) {
                const type = getTypeOfClass(cell);
                console.log(`type of class: ${type}`);

                let room = '';
                if (type === 'L' || type === 'T') {
                    room = worksheet.getCell(x + 1, y).value?.toString() || '';
                } else if (type === 'P') {
                    const valueBelow = worksheet.getCell(x + 1, y).value?.toString() || '';
                    const valueTwoBelow = worksheet.getCell(x + 2, y).value?.toString() || '';
                    room = `${valueBelow} ${valueTwoBelow}`.trim();
                    console.log(room);
                }

                const mergedCellsCount = countMergedCellsAlongRow(mergedCellsMap, cellAddress);
                
                for (let m = y; m < y + mergedCellsCount; m += 2) {
                    const currentSubgroup = removeWhitespace(worksheet.getCell(5, m).value?.toString());
                    if (!currentSubgroup) continue;

                    if (!result[currentSubgroup]) {
                        result[currentSubgroup] = {};
                    }
                    if (!result[currentSubgroup][day]) {
                        result[currentSubgroup][day] = {};
                    }

                    if (type === 'L') {
                        const tVal = handleLecture(worksheet, x, y, currentSubgroup, day, time, cell, result, mergedCellsMap, room, subjectMap);
                        if (tVal !== null) {
                            skipNext = true;
                        }
                    } else if (type === 'P') {
                        handlePractical(worksheet, x, y, currentSubgroup, day, time, cell, result, room, subjectMap);
                        skipNext = true;
                    } else if (type === 'T') {
                        const tVal = handleTutorial(worksheet, x, y, currentSubgroup, day, time, cell, result, room, subjectMap);
                        if (tVal !== null) {
                            skipNext = true;
                        }
                    }
                }
            }
        }
    }
}


