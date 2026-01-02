# Quick Start Guide

## Setup (One Time)

```bash
cd parser-ts
npm install
```

## Parse Your Timetable

### Option 1: Basic Parse (Fast)
```bash
npm run parse
```
**Output**: `output/resultsTIMETABLEJULYTODEC25.json`
**Time**: ~10 seconds
**Format**: `["SubjectCode", "Room"]`

### Option 2: Full Parse with Subject Names (Slow)
```bash
npm run parse
npm run scrape
npm run enrich
```
**Output**: Enriched JSON with subject names
**Time**: ~5-10 minutes (depends on network)
**Format**: `["SubjectCode", "Room", "Subject Name", "Class Type"]`

## Verify Output

```bash
node compare.js
```

Shows comparison between TypeScript and Python outputs.

## Check for Data Issues

```bash
npm run check
```

Finds empty or missing subject names.

## File Locations

- **Input**: `../parser/utilities/TIMETABLEJULYTODEC25.xlsx`
- **Output**: `output/resultsTIMETABLEJULYTODEC25.json`
- **Subjects**: `output/subjects.json`

## Example Output

```json
{
  "1A11": {
    "Monday": {
      "08:50 AM": ["UCB009L", "LP101"],
      "09:40 AM": ["UEN008L", "LP101"]
    }
  }
}
```

## Troubleshooting

**Error: Cannot find Excel file**
- Make sure `TIMETABLEJULYTODEC25.xlsx` exists in `../parser/utilities/`

**Times are wrong**
- Fixed! Uses UTC time extraction

**Missing subject names**
- Run `npm run scrape` then `npm run enrich`

**Network errors during scraping**
- Normal - some subject codes may not exist in database
- The scraper will continue and use the code as the name

