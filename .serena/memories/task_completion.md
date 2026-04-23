# Task Completion Checklist

Before finishing code changes:

- Confirm behavior change is implemented.
- Add or update relevant unit/request tests when behavior changes.
- Run the most relevant focused tests while iterating.
- Run `cd app && npm run lint` when feasible.
- Run `cd app && npm run build` when feasible for TypeScript/build-affecting changes.
- Ensure no accidental generated files were introduced outside `app/dist/`.
- Check `git status --short --branch` and do not revert unrelated local changes.