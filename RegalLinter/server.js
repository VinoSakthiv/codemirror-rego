const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

app.use(express.json());

app.post('/run-linter', async (req, res) => {
    try {
        const payload = req.body.payload;
        console.log(payload);
        if (!payload) {
            return res.status(400).json({ error: 'No payload provided' });
        }

        const policyFilePath = path.join(__dirname, 'policy.rego');

        // Write the payload to a temporary file
        fs.writeFileSync(policyFilePath, payload);

        const linterPath = 'C:\\Platform2023\\Hack2024\\codemirror-rego\\RegalLinter\\regal';
        const args = ['lint', policyFilePath];

        console.log(`Running command: ${linterPath} ${args.join(' ')}`);

        const linter = spawn(linterPath, args, { cwd: 'C:\\Platform2023\\Hack2024\\codemirror-rego\\RegalLinter' });

        let stdout = '';
        let stderr = '';

        linter.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        linter.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        linter.on('close', (code) => {
            if (code !== 3) {
                console.error(`Linter process exited with code ${code}`);
                return res.status(500).json({ error: stderr });
            }
            console.log(stdout)
            const violations = parseLinterOutput(stdout);
            res.json({ result: violations });        });
    } catch (err) {
        console.error(`Server error: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
function parseLinterOutput(output) {
    const lines = output.split('\n');
    const violations = [];
    let currentViolation = null;

    lines.forEach(line => {
        if (line.startsWith('Rule:')) {
            if (currentViolation) {
                violations.push(currentViolation);
            }
            currentViolation = { rule: line.split(': ')[1].trim() };
        } else if (line.startsWith('Description:')) {
            currentViolation.description = line.split(': ')[1].trim();
        } else if (line.startsWith('Category:')) {
            currentViolation.category = line.split(': ')[1].trim();
        } else if (line.startsWith('Location:')) {
            currentViolation.location = line.split(': ')[1].trim();
        } else if (line.startsWith('Text:')) {
            currentViolation.text = line.split(': ')[1].trim();
        } 
    });

    if (currentViolation) {
        violations.push(currentViolation);
    }

    return violations;
}
