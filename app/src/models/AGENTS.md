# Model Filtering And Sorting Guidance

Keep route-level filtering and sorting capabilities owned by the model.

When a model supports public query filtering, expose allowed fields through a
model static named `getFilterableFields()`. When it supports public sorting,
expose allowed fields through `getSortableFields()`.

Prefer this pattern over hardcoding allowed fields inside request handlers,
routes, or middleware. Route middleware should receive the model and ask the
model for its filterable and sortable fields.

Example:

```ts
router.get(
    "/",
    [sortMiddleware(Event), filterMiddleware(Event)],
    list
);
```

For model-specific parsing rules, keep the preprocess logic next to the model
static. For example, event date filtering is defined in
`app/src/models/event/statics.ts`, where the `date` filter preprocesses relative
date aliases such as `today`, `this week`, and `this month`.

Only add a field to `getFilterableFields()` or `getSortableFields()` when it is
safe for clients to query directly. For user-scoped data such as "my events",
prefer a dedicated authenticated endpoint that derives ownership from the token
instead of exposing an arbitrary `author` filter.
