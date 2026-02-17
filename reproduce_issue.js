
import { calculateBazi } from './src/lib/bazi.js';
import { generateNames } from './src/lib/naming.js';

try {
    console.log("Testing Naming System for crash...");
    
    const birthTime = '2024-01-01 08:00';
    const bazi = calculateBazi(birthTime, 120);
    
    console.log("Generating Names (Female)...");
    const namesFemale = generateNames('杨', bazi, 10, 0, 'female', 'all');
    console.log(`Generated ${namesFemale.length} female names.`);
    
    console.log("Generating Names (Male)...");
    const namesMale = generateNames('杨', bazi, 10, 0, 'male', 'all');
    console.log(`Generated ${namesMale.length} male names.`);

    console.log("Test Complete. No crash.");
} catch (e) {
    console.error("Test Failed with Error:");
    console.error(e);
}
