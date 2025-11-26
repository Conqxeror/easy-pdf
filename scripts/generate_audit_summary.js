const fs = require('fs');
const path = require('path');

const visualReportPath = path.join(__dirname, '../visual_report.json');
const a11yReportPath = path.join(__dirname, '../accessibility_report.json');
const seoReportPath = path.join(__dirname, '../seo_audit.json');
const summaryPath = path.join(__dirname, '../audit_summary.json');
const csvPath = path.join(__dirname, '../detailed_issues.csv');

const summary = {
	timestamp: new Date().toISOString(),
	counts: {
		critical: 0,
		high: 0,
		medium: 0,
		low: 0,
		total: 0
	},
	issues: []
};

function addIssue(page, type, severity, description, evidence) {
	summary.issues.push({
		id: `ISSUE-${String(summary.issues.length + 1).padStart(3, '0')}`,
		page,
		type,
		severity,
		description,
		evidence
	});
	summary.counts[severity]++;
	summary.counts.total++;
}

// Process Visual Report
if (fs.existsSync(visualReportPath)) {
	try {
		const visual = JSON.parse(fs.readFileSync(visualReportPath, 'utf8'));
		visual.results.forEach(r => {
			if (r.status === 'failed' || r.status === 'error') {
				addIssue(r.url, 'visual', 'high', `Visual crawl failed: ${r.error || r.statusCode}`, r.desktopScreenshot);
			}
			if (r.issues && r.issues.length > 0) {
				r.issues.forEach(i => {
					addIssue(r.url, 'visual', 'medium', i, r.mobileScreenshot);
				});
			}
		});
	} catch (e) {
		console.error('Error parsing visual report:', e);
	}
}

// Process A11y Report
if (fs.existsSync(a11yReportPath)) {
	try {
		const a11y = JSON.parse(fs.readFileSync(a11yReportPath, 'utf8'));
		a11y.results.forEach(r => {
			if (r.violations) {
				r.violations.forEach(v => {
					const severity = v.impact === 'critical' || v.impact === 'serious' ? 'high' : 'medium';
					addIssue(r.url, 'accessibility', severity, `${v.id}: ${v.description}`, null);
				});
			}
			if (r.error) {
				addIssue(r.url, 'accessibility', 'low', `Audit failed: ${r.error}`, null);
			}
		});
	} catch (e) {
		console.error('Error parsing a11y report:', e);
	}
}

// Process SEO Report
if (fs.existsSync(seoReportPath)) {
	try {
		const seo = JSON.parse(fs.readFileSync(seoReportPath, 'utf8'));
		seo.results.forEach(r => {
			if (r.issues) {
				r.issues.forEach(i => {
					addIssue(r.url, 'seo', 'medium', i, null);
				});
			}
			if (r.error) {
				addIssue(r.url, 'seo', 'low', `Audit failed: ${r.error}`, null);
			}
		});
	} catch (e) {
		console.error('Error parsing seo report:', e);
	}
}

// Write Summary
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

// Write CSV
const csvHeader = 'id,page,severity,type,description,evidence_path\n';
const csvRows = summary.issues.map(i =>
	`${i.id},"${i.page}",${i.severity},${i.type},"${i.description.replace(/"/g, '""')}","${i.evidence || ''}"`
).join('\n');
fs.writeFileSync(csvPath, csvHeader + csvRows);

console.log(`Generated audit summary with ${summary.issues.length} issues.`);
