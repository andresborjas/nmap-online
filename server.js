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
    const { target, ports, flags, customArgs } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    // Basic validation to prevent command injection
    // Allow alphanumeric, dots, hyphens. No spaces or special chars.
    const isValidTarget = /^[a-zA-Z0-9.-]+$/.test(target);

    if (!isValidTarget) {
        return res.status(400).json({ error: 'Invalid target format' });
    }

    const nmapArgs = [];

    // Add flags
    const allowedFlags = ['-sV', '-O', '-A', '-Pn'];
    if (flags && Array.isArray(flags)) {
        flags.forEach(flag => {
            if (allowedFlags.includes(flag)) {
                nmapArgs.push(flag);
            }
        });
    }

    // Add ports
    if (ports) {
        // Validate ports: numbers, commas, hyphens only
        const isValidPorts = /^[0-9,-]+$/.test(ports);
        if (!isValidPorts) {
            return res.status(400).json({ error: 'Invalid ports format. Use numbers, commas, and hyphens (e.g., 80,443 or 1-1000)' });
        }
        nmapArgs.push('-p', ports);
    } else {
        // Default to fast scan if no ports specified, unless other flags present?
        // Let's keep it simple: if no ports, nmap scans top 1000 by default.
        // If we want fast scan as default:
        if (!flags && !customArgs) nmapArgs.push('-F');
    }

    // Add custom args
    if (customArgs) {
        // Basic validation: allow alphanumeric, dashes, equals, spaces (but split by space)
        // We need to be careful here. execFile takes an array of arguments.
        // We should split customArgs by space, but respect quotes if possible?
        // For simplicity, let's split by space and validate each part.
        // Also disallow shell metacharacters just in case.
        if (/[;&|`]/.test(customArgs)) {
            return res.status(400).json({ error: 'Invalid characters in custom arguments' });
        }

        const args = customArgs.split(/\s+/).filter(arg => arg.length > 0);
        nmapArgs.push(...args);
    }

    nmapArgs.push(target);

    console.log(`Scanning target: ${target} with args: ${nmapArgs.join(' ')}`);

    // Execute nmap
    execFile('nmap', nmapArgs, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing nmap: ${error.message}`);

            // Check for root privilege error
            if (stderr && stderr.includes('requires root privileges')) {
                return res.status(403).json({
                    error: 'Root privileges required',
                    details: 'This scan type (e.g., OS detection, -sS) requires root privileges. Please run the server with sudo.'
                });
            }

            // If nmap is not found, it will error here.
            return res.status(500).json({ error: 'Scan failed', details: stderr || error.message });
        }

        const fullCommand = `nmap ${nmapArgs.join(' ')}`;
        res.json({ output: stdout, command: fullCommand });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
