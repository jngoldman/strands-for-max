import { generatePuzzle } from '../src/logic/generator';
import curriculum from '../src/data/curriculum.json';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUZZLES_PER_THEME = 5; 
const OUTPUT_FILE = join(__dirname, '../src/data/puzzles.json');

const allPuzzles: any = {
  grade1: [],
  grade2: []
};

console.log("Starting puzzle pre-generation for Max...");

for (const [grade, themes] of Object.entries(curriculum)) {
  console.log(`\n--- Grade: ${grade} ---`);
  for (const theme of themes as any[]) {
    let count = 0;
    let attempts = 0;
    console.log(`  Processing Theme: ${theme.theme}`);
    
    while (count < PUZZLES_PER_THEME && attempts < 10000) {
      attempts++;
      if (attempts % 500 === 0) console.log(`    Attempt ${attempts}...`);
      
      const p = generatePuzzle(8, 6, theme.theme, theme.clue, theme.words, theme.spangram);
      if (p) {
        const isDup = (allPuzzles[grade] || []).some((existing: any) => 
          JSON.stringify(existing.grid) === JSON.stringify(p.grid)
        );
        if (!isDup) {
          if (!allPuzzles[grade]) allPuzzles[grade] = [];
          allPuzzles[grade].push(p);
          count++;
          console.log(`    SUCCESS [${count}/${PUZZLES_PER_THEME}] after ${attempts} attempts.`);
          attempts = 0; 
        }
      }
    }
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPuzzles, null, 2));
console.log(`\nDONE! Generated ${Object.values(allPuzzles).flat().length} puzzles.`);
