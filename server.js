const express = require('express');
const path = require('path');
const { runCustomBenchmark } = require('./custom-benchmark');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// State variables to track currently running job to prevent double-execution
let isRunning = false;

// API Endpoint to run the benchmark
app.post('/api/benchmark', async (req, res) => {
    if (isRunning) {
        return res.status(409).json({ error: 'A benchmark is already currently running' });
    }

    try {
        isRunning = true;
        const txCount = req.body.txCount || 50;

        // Execute the benchmark script from the existing custom-benchmark.js file
        console.log(`Starting execution from API with ${txCount} transactions...`);
        const results = await runCustomBenchmark(txCount);

        if (results.error) {
            return res.status(500).json({ success: false, error: results.error });
        }

        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        isRunning = false;
    }
});

// Start the Web Server
app.listen(PORT, () => {
    console.log(`Server hosted at http://localhost:${PORT}`);
});
