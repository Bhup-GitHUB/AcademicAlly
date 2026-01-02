import { promises as fs } from 'fs';
import path from 'path';
import { SubjectMap } from './types';

function findEmpty(data: SubjectMap): string[] {
    const blankKeys: string[] = [];
    
    for (const key in data) {
        const value = data[key];
        if (value === null || value === '' || value === undefined) {
            blankKeys.push(key);
        }
    }
    
    return blankKeys;
}

function findIdentical(data: SubjectMap): string[] {
    const identicalKeys: string[] = [];
    
    for (const key in data) {
        const value = data[key];
        if (value === key) {
            identicalKeys.push(key);
        }
    }
    
    return identicalKeys;
}

async function main() {
    const filePath = path.join(__dirname, '../../parser-ts/output/subjects.json');

    console.log('Reading subjects data...');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: SubjectMap = JSON.parse(fileContent);

    const blankKeys = findEmpty(data);
    const identicalKeys = findIdentical(data);

    console.log('blankKeys:', blankKeys);
    console.log('identicalKeys:', identicalKeys);
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});

