# Development Work Culture

This file contains some rules about the workflow.

---

## New Commit

Because we are working in a small team, there is no need to branch-out and push to separate branches in order to _merge request_ into `main`/`master` branch. To make everyone up-to-date just use the [`CHANGELOG.md`](../docs/CHANGELOG.md) file and document what new have you introduced or changed so everyone have a quick access to the information.

Here's a template of a new entry:

```md
## [[x.y.z]] - YYYY-MM-DD

###### _([diff: a.b.c-x.y.z])_

**Optional: Description**

Added / Changed / Fixed / Removed:

- Something
```

And at the bottom just add href's:

```md
[diff: a.b.c-x.y.z]: https://github.com/Luzkan/CryptoImage/compare/a.b.c...x.y.z
[x.y.z]: https://github.com/Luzkan/CryptoImage/releases/tag/x.y.z
```

Where `x.y.z` version number can be described as:

- `x` - Major Changes
- `y` - Minor Changes
- `z` - Patch-like Changes

---
