// Options Logic
const Config = window.WebFilter_Config;

document.addEventListener('DOMContentLoaded', async () => {
    const keywordsList = document.getElementById('keywordsList');
    const sitesList = document.getElementById('sitesList');
    const newKeywordInput = document.getElementById('newKeyword');
    const addKeywordBtn = document.getElementById('addKeywordBtn');

    let config = await Config.load();

    function renderKeywords() {
        keywordsList.innerHTML = '';
        config.keywords.forEach(kw => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                <span class="text">${kw}</span>
                <span class="remove" data-kw="${kw}">×</span>
            `;
            keywordsList.appendChild(tag);

            tag.querySelector('.remove').addEventListener('click', async (e) => {
                const word = e.target.getAttribute('data-kw');
                config.keywords = config.keywords.filter(k => k !== word);
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
        if (val && !config.keywords.includes(val)) {
            config.keywords.push(val);
            await Config.save(config);
            newKeywordInput.value = '';
            renderKeywords();
        }
    });

    // Initial Render
    renderKeywords();
    renderSites();
});
