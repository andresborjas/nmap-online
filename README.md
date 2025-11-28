# Nmap Online

A simple web interface for running Nmap scans.

## Description

Nmap Online provides a web-based GUI to execute Nmap scans against a target. It allows users to specify a target domain or IP address and optionally a list of ports to scan. The application validates inputs to prevent command injection and ensures safe usage.

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   **Node.js**: You need to have Node.js installed.
*   **Nmap**: Nmap must be installed and available in your system's PATH.

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory.
3.  Install the dependencies:

    ```bash
    npm install
    ```

## Usage

1.  Start the server:

    ```bash
    npm start
    ```

2.  Open your web browser and navigate to `http://localhost:3000`.

3.  Enter a target (domain or IP) and optionally specify ports (e.g., `80,443` or `1-1000`).

4.  Click "Scan" to view the results.

## API

### POST /api/scan

Initiates an Nmap scan.

**Request Body:**

```json
{
  "target": "example.com",
  "ports": "80,443" // Optional
}
```

**Response:**

```json
{
  "output": "Starting Nmap..."
}
```

## Security Note

This application executes system commands (`nmap`). While input validation is in place, be cautious when deploying this application in a production environment or exposing it to the public internet. Ensure that the user running the Node.js process has appropriate permissions.
