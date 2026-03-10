const { runCustomBenchmark } = require('./custom-benchmark');
const fs = require('fs');
const path = require('path');

async function generate() {
    console.log("Generating static benchmark results...");
    try {
        const results = await runCustomBenchmark(50);

        const publicDir = path.join(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        const outputPath = path.join(publicDir, 'results.json');

        if (results.error) {
            fs.writeFileSync(outputPath, JSON.stringify({ success: false, error: results.error }, null, 2));
        } else {
            fs.writeFileSync(outputPath, JSON.stringify({ success: true, data: results }, null, 2));
        }

        console.log(`Successfully generated static benchmark results to ${outputPath}`);
    } catch (err) {
        console.error("Failed to generate results:", err);
        process.exit(1);
    }
}

generate();
