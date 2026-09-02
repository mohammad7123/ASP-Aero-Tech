---
name: API codegen re-export collision
description: Records the Orval/Zod barrel issue that appears when generated endpoints include path parameters.
---

Keep the API Zod package's public barrel focused on the generated runtime schemas rather than wildcard re-exporting the generated TypeScript types.

**Why:** The current Orval output creates both a runtime schema and a generated type with the same path-parameter name, so wildcard re-exports fail TypeScript with an ambiguous export.

**How to apply:** After regenerating the API, remove the generated-types wildcard export from the API Zod barrel before running the workspace typecheck.