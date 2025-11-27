# Library Loader

This directory contains dynamic library loaders that fetch external dependencies from CDN instead of bundling them directly.

## marked-loader.js

Dynamically loads the marked.js markdown parser from jsDelivr CDN.

**CDN URL:** `https://cdn.jsdelivr.net/npm/marked@17.0.1/marked.min.js`

### Usage

```javascript
import { parseMarkdown } from "../lib/marked-loader.js";

// Parse markdown to HTML
const html = await parseMarkdown("# Hello World");
```

### Benefits

-   Reduces extension bundle size
-   Always fetches the latest stable version from CDN
-   Caches the library after first load
-   Handles loading errors gracefully
