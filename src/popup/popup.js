// Popup Logic
const Config = window.WebFilter_Config;

document.addEventListener('DOMContentLoaded', async () => {
    const siteNameEl = document.getElementById('siteName');
    const siteToggle = document.getElementById('siteToggle');
    const keywordInput = document.getElementById('keywordInput');
    const addBtn = document.getElementById('addBtn');
    const optionsBtn = document.getElementById('optionsBtn');
    const messageEl = document.getElementById('message');

    // Load Config
    let config = await Config.load();

    // Get Current Tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let hostname = '';

    if (tab && tab.url) {
        try {
            const url = new URL(tab.url);
            hostname = url.hostname;
        } catch (e) {
            hostname = 'unknown';
        }
    }

    // UI Init
    siteNameEl.textContent = hostname;
    const isEnabled = Config.isSiteEnabled(config, hostname);
    siteToggle.checked = isEnabled;

    // Handlers

    // Toggle Site
    siteToggle.addEventListener('change', async () => {
        const enabled = siteToggle.checked;

        // Update simple domain map
        // Note: For complex sites we might want to store base domain, 
        // but for V1 we stick to what ConfigManager handles.
        // We really should store the specific hostname or a pattern.
        // Simple approach: Store the exact hostname or update if exists.

        // Find if we have a rule key matching this host
        let matchedKey = Object.keys(config.siteRules).find(key => hostname.includes(key));

        if (matchedKey) {
            config.siteRules[matchedKey] = enabled;
        } else {
            // New site
            config.siteRules[hostname] = enabled;
        }

        await Config.save(config);

        // Optional: Reload tab to apply?
        messageEl.textContent = "Saved. Reload page to apply.";
        setTimeout(() => messageEl.textContent = "", 2000);
    });

    // Add Keyword
    addBtn.addEventListener('click', async () => {
        const val = keywordInput.value.trim();
        if (val) {
            if (!config.keywords.includes(val)) {
                config.keywords.push(val);
                await Config.save(config);
                messageEl.textContent = "Keyword added!";
                keywordInput.value = "";
                setTimeout(() => messageEl.textContent = "", 2000);
            } else {
                messageEl.textContent = "Keyword already exists.";
            }
        }
    });

    // Open Options
    optionsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('src/options/options.html'));
        }
    });

});
