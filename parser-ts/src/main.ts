import ExcelJS from 'exceljs';
import { promises as fs } from 'fs';
import path from 'path';
import { parser } from './utilities';
import { TimetableData } from './types';

// Helper function to count non-empty cells in a worksheet
function countNonEmptyCells(worksheet: ExcelJS.Worksheet): number {
    let count = 0;
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            if (cell.value) count++;
        });
    });
    return count;
}

async function main() {
    const workbookPath = path.join(__dirname, '../timetable.xlsx');
    const outputPath = path.join(__dirname, '../output/resultsTIMETABLEJANTOMAY26.json');
    const subjectsPath = path.join(__dirname, '../output/subjects.json');

    console.log('Loading workbook...');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(workbookPath);

    // Load subjects map if it exists
    let subjectMap: { [key: string]: string } = {};
    try {
        const subjectsContent = await fs.readFile(subjectsPath, 'utf-8');
        subjectMap = JSON.parse(subjectsContent);
        console.log('Loaded subjects map with', Object.keys(subjectMap).length, 'entries');
    } catch (error) {
        console.log('No subjects.json found, will use subject codes as names');
    }

    const result: TimetableData = {};

    // Deduplicate worksheets with similar names (e.g., "3RD YEAR B" vs "3RD YEAR B ")
    // Keep only the sheet with more data
    const sheetMap = new Map<string, ExcelJS.Worksheet>();
    const sheetCellCounts = new Map<string, number>();

    workbook.worksheets.forEach(worksheet => {
        const normalizedName = worksheet.name.trim();
        const cellCount = countNonEmptyCells(worksheet);
        
        console.log(`Sheet "${worksheet.name}" (normalized: "${normalizedName}") has ${cellCount} non-empty cells`);
        
        const existingCount = sheetCellCounts.get(normalizedName) || 0;
        if (cellCount > existingCount) {
            sheetMap.set(normalizedName, worksheet);
            sheetCellCounts.set(normalizedName, cellCount);
        }
    });

    console.log('\nParsing deduplicated worksheets...');
    sheetMap.forEach((worksheet, normalizedName) => {
        console.log(`---------------------${normalizedName} (original: "${worksheet.name}")-----------------`);
        parser(worksheet, result, subjectMap);
    });

    console.log('Writing output...');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 4));

    console.log(`Successfully created: ${outputPath}`);
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});


