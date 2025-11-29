import { readFileSync } from 'fs';

try {
    const r = JSON.parse(readFileSync('test-results.json', 'utf8'));
    const f = r.testResults.filter((t) => t.status === 'failed');
    if (f.length === 0) {
        console.log('PASS');
        process.exit(0);
    }
    f.forEach((t) => {
        console.log(`FAIL: ${t.name}`);
        t.assertionResults.forEach((a) => {
            if (a.status === 'failed') {
                console.log(`  ${a.title}: ${a.failureMessages.join('\n  ')}`);
            }
        });
    });
    process.exit(1);
} catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
}
