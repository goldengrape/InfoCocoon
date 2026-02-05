// Options Logic
const Config = window.WebFilter_Config;

document.addEventListener('DOMContentLoaded', async () => {
    const keywordsList = document.getElementById('keywordsList');
    const sitesList = document.getElementById('sitesList');
    const newKeywordInput = document.getElementById('newKeyword');
    const expirySelect = document.getElementById('expirySelect');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const importExportMessage = document.getElementById('importExportMessage');

    let config = await Config.load();

    function showMessage(el, text, isError = false) {
        el.textContent = text;
        el.className = `message ${isError ? 'error' : 'success'}`;
        setTimeout(() => {
            el.textContent = '';
            el.className = 'message';
        }, 3000);
    }

    function formatExpiryDate(timestamp) {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        const now = new Date();
        const daysLeft = Math.ceil((timestamp - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) return '已过期';
        if (daysLeft <= 7) return `${daysLeft}天后过期`;
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function renderKeywords() {
        keywordsList.innerHTML = '';
        config.keywords.forEach(kw => {
            const tag = document.createElement('div');
            const expiryText = formatExpiryDate(kw.expiresAt);
            const isExpiringSoon = kw.expiresAt && (kw.expiresAt - Date.now()) < 7 * 24 * 60 * 60 * 1000;

            tag.className = `tag${isExpiringSoon ? ' expiring-soon' : ''}`;
            tag.innerHTML = `
                <span class="text">${kw.word}</span>
                ${expiryText ? `<span class="expiry">${expiryText}</span>` : ''}
                <span class="remove" data-kw="${kw.word}">×</span>
            `;
            keywordsList.appendChild(tag);

            tag.querySelector('.remove').addEventListener('click', async (e) => {
                const word = e.target.getAttribute('data-kw');
                Config.removeKeyword(config, word);
                await Config.save(config);
                renderKeywords();
            });
        });
    }

    function renderSites() {
        sitesList.innerHTML = '';
        Object.keys(config.siteRules).forEach(host => {
            const enabled = config.siteRules[host];
            const item = document.createElement('div');
            item.className = `site-item ${enabled ? 'enabled' : 'disabled'}`;
            item.innerHTML = `
                <span class="host">${host}</span>
                <button class="toggle-btn">${enabled ? 'Enabled' : 'Disabled'}</button>
            `;
            sitesList.appendChild(item);

            item.querySelector('.toggle-btn').addEventListener('click', async () => {
                config.siteRules[host] = !config.siteRules[host];
                await Config.save(config);
                renderSites();
            });
        });
    }

    // Add Keyword
    addKeywordBtn.addEventListener('click', async () => {
        const val = newKeywordInput.value.trim();
        if (val) {
            const expiryValue = expirySelect.value;
            const expiresInDays = expiryValue === 'permanent' ? null : parseInt(expiryValue);

            const added = Config.addKeyword(config, val, expiresInDays);
            if (added) {
                await Config.save(config);
                newKeywordInput.value = '';
                renderKeywords();
            }
        }
    });

    // Enter key support
    newKeywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addKeywordBtn.click();
        }
    });

    // Export Keywords
    exportBtn.addEventListener('click', () => {
        const jsonData = Config.exportKeywords(config);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `webfilter-keywords-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage(importExportMessage, `已导出 ${config.keywords.length} 个关键词`);
    });

    // Import Keywords
    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const result = Config.importKeywords(config, text);
            await Config.save(config);
            renderKeywords();
            showMessage(importExportMessage, `导入完成：新增 ${result.added} 个，跳过 ${result.skipped} 个重复`);
        } catch (err) {
            showMessage(importExportMessage, `导入失败：${err.message}`, true);
        }

        // Reset file input
        importFile.value = '';
    });

    // Initial Render
    renderKeywords();
    renderSites();
});
