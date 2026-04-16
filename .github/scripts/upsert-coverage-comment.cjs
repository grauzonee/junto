const fs = require("node:fs");
const path = require("node:path");

const marker = "<!-- junto-coverage-report -->";

module.exports = async function upsertCoverageComment({ github, context }) {
  const commentPath = process.env.COVERAGE_COMMENT_PATH || path.join(process.cwd(), "coverage-comment.md");
  const body = fs.readFileSync(commentPath, "utf8");
  const { owner, repo } = context.repo;
  const issue_number = context.payload.pull_request.number;
  const { data: comments } = await github.rest.issues.listComments({
    owner,
    repo,
    issue_number,
    per_page: 100,
  });
  const existingComment = comments.find(comment =>
    comment.user?.type === "Bot" && comment.body?.includes(marker)
  );

  if (existingComment) {
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingComment.id,
      body,
    });
    return;
  }

  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body,
  });
};
