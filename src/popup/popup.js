// Popup Logic
const Config = window.WebFilter_Config;

document.addEventListener('DOMContentLoaded', async () => {
    const siteNameEl = document.getElementById('siteName');
    const siteToggle = document.getElementById('siteToggle');
    const keywordInput = document.getElementById('keywordInput');
    const scopeSelect = document.getElementById('scopeSelect');
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

    // Populate scope selector with current site option
    if (scopeSelect && hostname && hostname !== 'unknown') {
        // Find the matching domain key from siteRules for cleaner display
        const matchedDomain = Object.keys(config.siteRules).find(key => hostname.includes(key));
        const domainLabel = matchedDomain || hostname;
        const siteOption = document.createElement('option');
        siteOption.value = domainLabel;
        siteOption.textContent = `仅 ${domainLabel}`;
        scopeSelect.appendChild(siteOption);
    }

    // Handlers

    // Toggle Site
    siteToggle.addEventListener('change', async () => {
        const enabled = siteToggle.checked;

        let matchedKey = Object.keys(config.siteRules).find(key => hostname.includes(key));

        if (matchedKey) {
            config.siteRules[matchedKey] = enabled;
        } else {
            config.siteRules[hostname] = enabled;
        }

        await Config.save(config);

        messageEl.textContent = "Saved. Reload page to apply.";
        setTimeout(() => messageEl.textContent = "", 2000);
    });

    // Add Keyword (popup uses permanent by default)
    addBtn.addEventListener('click', async () => {
        const val = keywordInput.value.trim();
        if (val) {
            const scopeValue = scopeSelect ? scopeSelect.value : 'global';
            const scope = scopeValue === 'global' ? null : scopeValue;
            const added = Config.addKeyword(config, val, null, scope);  // null = permanent
            if (added) {
                await Config.save(config);
                const scopeLabel = scope ? `[${scope}]` : '[全局]';
                messageEl.textContent = `已添加 ${scopeLabel}`;
                keywordInput.value = "";
                setTimeout(() => messageEl.textContent = "", 2000);
            } else {
                messageEl.textContent = "关键词已存在";
            }
        }
    });

    // Enter key support
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
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
