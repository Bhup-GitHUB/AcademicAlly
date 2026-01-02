# Timetable Parser - TypeScript

TypeScript implementation of Excel timetable parser for academic scheduling.

✅ **Status: Working and Tested** - Successfully parses 449 subgroups with correct times and room assignments.

## Installation

```bash
cd parser-ts
npm install
```

## Usage

### 1. Parse Excel to JSON
```bash
npm run parse
```
Converts `TIMETABLEJULYTODEC25.xlsx` to `output/resultsTIMETABLEJULYTODEC25.json`

### 2. Scrape Subject Names
```bash
npm run scrape
```
Fetches subject names from university website and creates `output/subjects.json`

### 3. Enrich Timetable Data
```bash
npm run enrich
```
Adds subject names and class types to the timetable JSON

### 4. Check for Anomalies
```bash
npm run check
```
Finds empty or identical subject entries

## Build

```bash
npm run build
```

## Project Structure

```
parser-ts/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── utilities.ts       # Excel parsing utilities
│   ├── main.ts           # Main parser
│   ├── subjectScraper.ts # Subject name scraper
│   ├── addSubjects.ts    # Data enrichment
│   └── anomalies.ts      # Quality checks
├── output/               # Generated JSON files
├── package.json
└── tsconfig.json
```

## Output Format

```json
{
  "1A11": {
    "Monday": {
      "08:50 AM": [
        "UCB009L",
        "LP101",
        "Chemistry / Applied Chemistry",
        "Lecture"
      ]
    }
  }
}
```

