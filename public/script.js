const scanBtn = document.getElementById('scanBtn');
const targetInput = document.getElementById('targetInput');
const output = document.getElementById('output');
const loader = document.querySelector('.loader');
const btnText = document.querySelector('.btn-text');

scanBtn.addEventListener('click', startScan);
targetInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startScan();
});

async function startScan() {
    const target = targetInput.value.trim();
    const ports = document.getElementById('portsInput').value.trim();

    if (!target) {
        output.textContent = 'Please enter a target.';
        output.style.color = '#ef4444';
        return;
    }

    setLoading(true);
    output.textContent = `Starting scan on ${target}...\nThis may take a few seconds.`;
    output.style.color = '#94a3b8';

    try {
        const body = { target };
        if (ports) body.ports = ports;

        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Scan failed');
        }

        output.textContent = data.output;
        output.style.color = '#10b981';
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        if (error.message.includes('Scan failed')) {
            output.textContent += '\n\nMake sure nmap is installed on the server.';
        }
        output.style.color = '#ef4444';
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        scanBtn.disabled = true;
        loader.style.display = 'block';
        btnText.style.display = 'none';
    } else {
        scanBtn.disabled = false;
        loader.style.display = 'none';
        btnText.style.display = 'block';
    }
}
