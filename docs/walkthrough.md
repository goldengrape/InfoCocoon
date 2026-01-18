# Web Filter - Verification Walkthrough

## 1. Installation
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in top right).
3.  Click **Load unpacked**.
4.  Select the project folder: `c:\Users\golde\code\web-filter`.

## 2. Test Configuration (Popup)
1.  Click the extension icon (puzzle piece -> Web Filter).
2.  **Toggle**: Ensure the switch is ON for the current site (try opening `youtube.com`).
3.  **Add Keyword**: Enter `test` or generic words like `video`, `shorts` (for YouTube) and click Add.

## 3. Test Filtering (YouTube)
1.  Go to [YouTube](https://www.youtube.com).
2.  Refresh the page.
3.  Observe that videos containing your keyword in the title are hidden (blank spaces might appear if layout doesn't reflow, but `VisualHider` sets `display: none` so it should reflow).
4.  Open Console (F12) to see `[WebFilter]` logs.

## 4. Test Filtering (Twitter/X)
1.  Go to [Twitter/X](https://x.com).
2.  Add a common keyword like `the`, `is` (just for testing).
3.  Refresh.
4.  Feed should be aggressively filtered.

## 5. Test Options
1.  Right-click extension icon -> Options.
2.  Or click gear icon in Popup.
3.  Verify you can see added keywords.
4.  Try removing a keyword.
5.  Go back to the site and refresh -> Content should reappear.
