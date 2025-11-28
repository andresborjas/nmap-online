const express = require('express');
const { execFile } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.post('/api/scan', (req, res) => {
    const { target, ports } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    // Basic validation to prevent command injection
    // Allow alphanumeric, dots, hyphens. No spaces or special chars.
    const isValidTarget = /^[a-zA-Z0-9.-]+$/.test(target);

    if (!isValidTarget) {
        return res.status(400).json({ error: 'Invalid target format' });
    }

    const nmapArgs = ['-F', target];

    if (ports) {
        // Validate ports: numbers, commas, hyphens only
        const isValidPorts = /^[0-9,-]+$/.test(ports);
        if (!isValidPorts) {
            return res.status(400).json({ error: 'Invalid ports format. Use numbers, commas, and hyphens (e.g., 80,443 or 1-1000)' });
        }
        // Replace -F (Fast mode) with specific ports if provided, or just append?
        // Usually -p overrides default scan. Let's remove -F if specific ports are given to be precise, 
        // or just add -p. Nmap allows both but -p is more specific.
        // Let's use -p and remove -F to avoid confusion, or keep -F as default if no ports.

        // Actually, let's just add -p. If -p is present, it scans those ports.
        // But wait, I defined nmapArgs with -F initially.
        // Let's reconstruct args.
        nmapArgs.length = 0; // Clear array
        nmapArgs.push('-p', ports, target);
    }

    console.log(`Scanning target: ${target} with ports: ${ports || 'default (-F)'}`);

    // Execute nmap
    execFile('nmap', nmapArgs, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing nmap: ${error.message}`);
            return res.status(500).json({ error: 'Scan failed', details: stderr || error.message });
        }

        res.json({ output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
