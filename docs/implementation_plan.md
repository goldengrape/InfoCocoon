# Implementation Plan - Web Filter Extension

## Goal Description
Build a Chrome Extension (Manifest V3) that filters web content (Twitter/X, YouTube, Bilibili) based on user-defined keywords. The project follows the Axiomatic Design analysis, ensuring a decoupled architecture with a focus on privacy and performance.

## User Review Required
> [!NOTE]
> This plan follows the module design specifications from `docs/context/Module_Design.md`.

## Proposed Changes

### Structure & Config
#### [NEW] [manifest.json](file:///c:/Users/golde/code/web-filter/manifest.json)
- Define `storage`, `activeTab`, `scripting` permissions.
- Register background service worker (optional, for event handling) and content scripts.
- Define popup and options pages.

### Core Logic (Utils)
#### [NEW] [config-manager.js](file:///c:/Users/golde/code/web-filter/src/utils/config-manager.js)
- Implements `ConfigManager` module.
- Wraps `chrome.storage.sync`.
- Provides `isSiteEnabled()` and immutable `FilterConfig`.

#### [NEW] [matcher.js](file:///c:/Users/golde/code/web-filter/src/utils/matcher.js)
- Implements `Matcher` module.
- Pure function `containsKeyword(text, keywords)`.
- Case-insensitive, substring matching.

#### [NEW] [site-strategies.js](file:///c:/Users/golde/code/web-filter/src/content/site-strategies.js)
- Implements `SiteStrategy` factory.
- Defines selectors for Twitter, YouTube, Bilibili.

### Content Script (The "Engine")
#### [NEW] [page-observer.js](file:///c:/Users/golde/code/web-filter/src/content/page-observer.js)
- Implements `PageObserver`.
- Uses `MutationObserver` to watch for new nodes.
- Debounces events.

#### [NEW] [visual-hider.js](file:///c:/Users/golde/code/web-filter/src/content/visual-hider.js)
- Implements `VisualHider`.
- Applies `display: none`.

#### [NEW] [content-script.js](file:///c:/Users/golde/code/web-filter/src/content/content-script.js)
- Orchestrator (Main entry point).
- Wires Config -> Strategy -> Observer -> Matcher -> Hider.

### UI Components
#### [NEW] [popup.html](file:///c:/Users/golde/code/web-filter/src/popup/popup.html)
#### [NEW] [popup.js](file:///c:/Users/golde/code/web-filter/src/popup/popup.js)
#### [NEW] [popup.css](file:///c:/Users/golde/code/web-filter/src/popup/popup.css)
- Main interface for toggling current site and quick add keywords.

#### [NEW] [options.html](file:///c:/Users/golde/code/web-filter/src/options/options.html)
#### [NEW] [options.js](file:///c:/Users/golde/code/web-filter/src/options/options.js)
- Full keyword management.

## Verification Plan
### Manual Verification
1.  **Component Test**: Load extension in Chrome Developer Mode.
2.  **Popup**: Verify settings save/load (persistence).
3.  **Sites**: 
    - Open Twitter, search for a keyword (e.g., "Trump"), verify tweets are hidden.
    - Open YouTube, verify video cards with keyword in title are hidden.
    - Open Bilibili, verify video cards are hidden.
4.  **Performance**: Scroll rapidly on Twitter to ensure no lag (Observer throttling).
