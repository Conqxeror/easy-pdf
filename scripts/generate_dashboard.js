const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../audit_summary.json');
const indexPath = path.join(__dirname, '../index.html');

if (!fs.existsSync(summaryPath)) {
	console.log('No audit summary found. Run generate_audit_summary.js first.');
	process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Easy PDF Audit Dashboard</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f4f4f5; color: #18181b; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { font-size: 2rem; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2.5rem; font-weight: bold; }
        .stat-label { color: #71717a; }
        .stat-critical { color: #ef4444; }
        .stat-high { color: #f97316; }
        .stat-medium { color: #eab308; }
        .stat-low { color: #3b82f6; }
        .issues { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 20px; text-align: left; border-bottom: 1px solid #e4e4e7; }
        th { background: #fafafa; font-weight: 600; }
        tr:last-child td { border-bottom: none; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; font-weight: 500; }
        .badge-critical { background: #fee2e2; color: #991b1b; }
        .badge-high { background: #ffedd5; color: #9a3412; }
        .badge-medium { background: #fef9c3; color: #854d0e; }
        .badge-low { background: #dbeafe; color: #1e40af; }
        .filter-bar { margin-bottom: 20px; display: flex; gap: 10px; }
        input { padding: 8px; border: 1px solid #d4d4d8; border-radius: 4px; width: 300px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Audit Dashboard</h1>
        <p>Generated at: ${new Date(summary.timestamp).toLocaleString()}</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value stat-critical">${summary.counts.critical}</div>
                <div class="stat-label">Critical Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-value stat-high">${summary.counts.high}</div>
                <div class="stat-label">High Priority</div>
            </div>
            <div class="stat-card">
                <div class="stat-value stat-medium">${summary.counts.medium}</div>
                <div class="stat-label">Medium Priority</div>
            </div>
            <div class="stat-card">
                <div class="stat-value stat-low">${summary.counts.low}</div>
                <div class="stat-label">Low Priority</div>
            </div>
        </div>

        <div class="filter-bar">
            <input type="text" id="search" placeholder="Search issues..." onkeyup="filterTable()">
        </div>

        <div class="issues">
            <table id="issuesTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Page</th>
                        <th>Severity</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Evidence</th>
                    </tr>
                </thead>
                <tbody>
                    ${summary.issues.map(issue => `
                        <tr>
                            <td>${issue.id}</td>
                            <td>${issue.page}</td>
                            <td><span class="badge badge-${issue.severity}">${issue.severity}</span></td>
                            <td>${issue.type}</td>
                            <td>${issue.description}</td>
                            <td>${issue.evidence ? `<a href="${issue.evidence}" target="_blank">View</a>` : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        function filterTable() {
            const input = document.getElementById('search');
            const filter = input.value.toLowerCase();
            const table = document.getElementById('issuesTable');
            const tr = table.getElementsByTagName('tr');

            for (let i = 1; i < tr.length; i++) {
                const td = tr[i].getElementsByTagName('td');
                let visible = false;
                for (let j = 0; j < td.length; j++) {
                    if (td[j] && td[j].innerText.toLowerCase().indexOf(filter) > -1) {
                        visible = true;
                    }
                }
                tr[i].style.display = visible ? '' : 'none';
            }
        }
    </script>
</body>
</html>
`;

fs.writeFileSync(indexPath, html);
console.log(`Generated dashboard at ${indexPath}`);
