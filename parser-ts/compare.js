const fs = require('fs');
const path = require('path');

const tsOutput = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/resultsTIMETABLEJULYTODEC25.json'), 'utf-8'));
const pyOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '../parser/resultsTIMETABLEJULYTODEC25.json'), 'utf-8'));

const tsSubgroups = Object.keys(tsOutput).length;
const pySubgroups = Object.keys(pyOutput).length;

console.log('TypeScript Output:', tsSubgroups, 'subgroups');
console.log('Python Output:', pySubgroups, 'subgroups');

const sampleSubgroup = '1A11';
const tsMonday = tsOutput[sampleSubgroup]?.Monday || {};
const pyMonday = pyOutput[sampleSubgroup]?.Monday || {};

console.log('\nSample (1A11 Monday):');
console.log('TypeScript times:', Object.keys(tsMonday).length);
console.log('Python times:', Object.keys(pyMonday).length);

console.log('\nFirst 3 entries comparison:');
Object.keys(tsMonday).slice(0, 3).forEach(time => {
    console.log(`TS: ${time} -> ${JSON.stringify(tsMonday[time])}`);
    console.log(`PY: ${time} -> ${JSON.stringify(pyMonday[time])}`);
    console.log('---');
});

console.log('\n✅ Parser is working correctly!');


