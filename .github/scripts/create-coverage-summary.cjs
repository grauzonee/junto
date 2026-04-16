const fs = require("node:fs");
const path = require("node:path");

const summaryPath = process.env.COVERAGE_SUMMARY_PATH || path.join(process.cwd(), "coverage", "coverage-summary.json");
const commentPath = process.env.COVERAGE_COMMENT_PATH || path.join(process.cwd(), "coverage-comment.md");

function getCoverageColor(linesPct) {
  if (linesPct >= 80) return "brightgreen";
  if (linesPct >= 60) return "yellow";
  return "red";
}

function requireCoverageTotal(summary) {
  if (!summary || !summary.total) {
    throw new Error(`Coverage summary at ${summaryPath} does not include a total section`);
  }
  return summary.total;
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const total = requireCoverageTotal(summary);
const linesPct = Number(total.lines.pct);
const color = getCoverageColor(linesPct);
const markdown = [
  "<!-- junto-coverage-report -->",
  "## Test Coverage",
  "",
  "| Metric | Percent | Covered / Total |",
  "| --- | ---: | ---: |",
  `| Lines | ${total.lines.pct}% | ${total.lines.covered} / ${total.lines.total} |`,
  `| Statements | ${total.statements.pct}% | ${total.statements.covered} / ${total.statements.total} |`,
  `| Functions | ${total.functions.pct}% | ${total.functions.covered} / ${total.functions.total} |`,
  `| Branches | ${total.branches.pct}% | ${total.branches.covered} / ${total.branches.total} |`,
  ""
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

fs.writeFileSync(commentPath, markdown);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `coverage=${total.lines.pct}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `color=${color}\n`);
}
