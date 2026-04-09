(async function() {
    const scripts = [
        "assets/js/fa-data-display.js",
        "assets/js/fa-interactive.js",
        "assets/js/fa-layout.js",
        "assets/js/fa-lists-tables.js",
        "assets/js/fa-media-utility.js",
        "assets/js/fa-typography.js",
    ]; 
    const stylesheets = [ "assets/css/fa-design-system.css" ];
    try {
        const componentLoadTimeout = 10000; // 10 seconds
        await Promise.all([
            ...stylesheets.map(href => new Promise((resolve, reject) => {
                const styleSheetEl = document.createElement('link');
                styleSheetEl.rel = 'stylesheet';
                styleSheetEl.fetchPriority = 'high';
                
                // FIXME: breaks locally viewing the website due to CORS issues
                //styleSheetEl.crossOrigin = 'anonymous';

                let cancellationToken = new AbortController();
                let timeoutId = setTimeout(() => { cancellationToken?.abort(); reject(new Error(`Stylesheet load timed out: ${href}`)); }, componentLoadTimeout);

                styleSheetEl.addEventListener('load', () => { clearTimeout(timeoutId); cancellationToken = null; resolve(); }, { once: true, signal: cancellationToken.signal });
                styleSheetEl.addEventListener('error', () => { clearTimeout(timeoutId); cancellationToken = null; reject(new Error(`Stylesheet failed to load: ${href}`)); }, { once: true, signal: cancellationToken.signal });

                styleSheetEl.href = href;
                document.head.appendChild(styleSheetEl);
            })),
            ...scripts.map(src => new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.async = true;
                let cancellationToken = new AbortController();
                let timeoutId = setTimeout(() => { cancellationToken?.abort(); reject(new Error(`Script load timed out: ${src}`)); }, componentLoadTimeout);
                script.addEventListener('load', () => { clearTimeout(timeoutId); cancellationToken = null; resolve(); }, { once: true, signal: cancellationToken.signal });
                script.addEventListener('error', () => { clearTimeout(timeoutId); cancellationToken = null; reject(new Error(`Script failed to load: ${src}`)); }, { once: true, signal: cancellationToken.signal });

                script.src = src;
                document.head.appendChild(script);
            }
        ))]);

        RenderWebsite();
    } catch (err) {
        RenderFallback(err);
    }

    function RenderWebsite() {
        function remember(key, value) {
            if (typeof key !== 'string' || value === null) throw new Error("Key and value must be non-null");
            try {
                const localStorageKey = `visitor_data`;
                let storedData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
                storedData[key] = value;
                localStorage.setItem(localStorageKey, JSON.stringify(storedData));
            } catch (err) {
                const expires = new Date(Date.now() + 365*24*60*60*1000).toUTCString(); // 1 year
                document.cookie = `visitor_${key}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
            }
        }
        function recall(key) { 
            if (typeof key !== 'string') throw new Error("Key must be a string");
            try {
                const localStorageKey = `visitor_data`;
                const storedData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
                return storedData[key] || null;
            } catch (err) {
                const match = document.cookie.match(new RegExp(`(?:^|; )visitor_${key}=([^;]*)`));
                return match ? decodeURIComponent(match[1]) : null;
            }
        }
        function forget(key) {
            if (typeof key !== 'string') throw new Error("Key must be a string");
            try {
                const localStorageKey = `visitor_data`;
                let storedData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
                if (typeof storedData[key] !== 'undefined') {
                    delete storedData[key];
                    localStorage.setItem(localStorageKey, JSON.stringify(storedData));
                }
            } catch (err) {
                document.cookie = `visitor_${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
            }
        }

        Array.from(document.body.children).forEach(c => { if (c.tagName !== 'NOSCRIPT') c.remove(); });

        document.title = "TetteDev";
        const body = document.createElement('fa-body');

        const main = document.createElement('div');
        main.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:48px; padding:48px 48px 0;';

        const hero = document.createElement('fa-section');
        hero.id = 'hero';
        hero.setAttribute('accent', 'blue');

        const heroInner = document.createElement('div');
        heroInner.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center; padding:48px 0;';

        const h1 = document.createElement('fa-h1');
        h1.setAttribute('underline', '');
        h1.textContent = 'Hello there!';
        heroInner.appendChild(h1);

        const heroP = document.createElement('fa-p');
        heroP.textContent = 'Welcome to my personal website! Feel free to look around and check out some of my projects below.';
        heroInner.appendChild(heroP);

        const heroCta = document.createElement('fa-button');
        heroCta.setAttribute('variant', 'primary');
        heroCta.setAttribute('size', 'lg');
        heroCta.textContent = 'Visit my GitHub';
        heroCta.addEventListener('click', () => { window.open("https://github.com/TetteDev", "_blank"); });
        heroInner.appendChild(heroCta);
        hero.appendChild(heroInner);
        main.appendChild(hero);

        const langToShort = (full) => {
            switch (full) {
                case "JavaScript": return "JS";
                case "TypeScript": return "TS";
                case "Shell": return "SH";
                case "PowerShell": return "PS";
                default: return full;
            }
        };

        const gists = document.createElement('fa-section');
        gists.id = 'gists';
        gists.setAttribute('title', 'Some of my most recent Gists');
        gists.setAttribute('accent', 'amber');

        const gistsGrid = document.createElement('div');
        gistsGrid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px;';

        async function fetchGists() {
            const countGists = 8;
            const gistsUrl = `https://api.github.com/users/TetteDev/gists?per_page=${countGists}`;
            return fetch(gistsUrl).then(res => {
                const isOk = res.ok;
                if (isOk) {
                    return res.json();
                }
                else {
                    throw new Error(`GitHub API request failed with status ${res.status}`);
                }
            });
        }
        function renderGists(json) { 
            const MAX_GISTS = 9999; // maximum number of gists to display (after filtering and sorting)
            // NOTE: inside fetchGists, we set per page to 8, so this MAX_GISTS variable is mostly just a fallback in case we decide to fetch more gists at once in the future

            const SORT_BY_UPDATED = true; // whether to sort gists by last updated time (most recent first)
            const SORT_BY_UPDATED_DESCENDING = true; // if sorting by updated time, whether to show most recently updated gists first (if false, shows least recently updated first)

            let gists = typeof json === 'string' ? JSON.parse(json) : json;
            if (SORT_BY_UPDATED === true) {
                gists.sort((a, b) => SORT_BY_UPDATED_DESCENDING ? new Date(b.updated_at) - new Date(a.updated_at) : new Date(a.updated_at) - new Date(b.updated_at));
            }

            gistsGrid.querySelectorAll('fa-card').forEach(c => {
                //if (!c.hasAttribute('spotlight')) c.remove();
                c.remove();
            });

            gists = gists.slice(0, MAX_GISTS);
            // Render the appropriate entries into our gists grid based on the fetched JSON data
            gists.forEach(({ description, html_url, url, files }) => {
                if (!files || Object.keys(files).length === 0) return; // skip gists with no files

                const { filename, language, raw_url, accent = 'blue' } = Object.values(files)[0];
                const card = document.createElement('fa-card');
                card.setAttribute('hover', '');
                card.setAttribute('accent', accent);
                const cardHeader = document.createElement('div');
                cardHeader.slot = 'header';
                cardHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between;';
                const cardTitle = document.createElement('fa-h3');
                cardTitle.textContent = filename || 'Untitled Gist';
                cardHeader.appendChild(cardTitle);
                const cardBadge = document.createElement('fa-badge');
                cardBadge.setAttribute('variant', 'success');
                cardBadge.textContent = langToShort(language) || 'Other';
                cardHeader.appendChild(cardBadge);
                card.appendChild(cardHeader);
                const cardBody = document.createElement('fa-p');
                cardBody.textContent = description || `No description provided.`;
                card.appendChild(cardBody);
                if (raw_url) {
                    card.dataset.source = html_url || url || raw_url; // prefer linking to the gist page rather than the raw file
                    card.addEventListener('click', () => { 
                        card.dataset.source && window.open(card.dataset.source, "_blank") 
                    });
                }
                gistsGrid.appendChild(card);
            });
        }

        const DONT_FETCH_GISTS_AUTO = true;
        const gistsCacheKey = "cachedGists";
        const cachedGistsJson = recall(gistsCacheKey);
        if (cachedGistsJson) {
            renderGists(cachedGistsJson);
        }
        else {
            if (DONT_FETCH_GISTS_AUTO === false) {
                try {
                    fetchGists().then(json => {
                        remember(gistsCacheKey, JSON.stringify(json));
                        renderGists(json);
                    });
                } catch (err) {
                    console.error("Error fetching gists:", err);
                    remember(gistsCacheKey, JSON.stringify([]));
                }
            }
        }
        gists.appendChild(gistsGrid);
        main.appendChild(gists);

        if (cachedGistsJson || (DONT_FETCH_GISTS_AUTO === true)) {
            const clearCacheGistBtn = document.createElement('fa-button');
            clearCacheGistBtn.setAttribute('variant', 'warning');
            clearCacheGistBtn.setAttribute('size', 'sm');
            const btnText = cachedGistsJson ? 'Clear Cache & Update Gists' : 'Update Gists';
            clearCacheGistBtn.textContent = btnText;
            clearCacheGistBtn.style.marginTop = '16px';
            clearCacheGistBtn.addEventListener('click', () => { alert('not implemented yet'); });

            gists.appendChild(clearCacheGistBtn);
        }

        const projects = document.createElement('fa-section');
        projects.id = 'projects';
        projects.setAttribute('title', 'Some of my projects');
        projects.setAttribute('accent', 'green');

        const projectsGrid = document.createElement('div');
        projectsGrid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px;';

        const highlightedProjectData = [
            {
                title: 'Frutiger Aero UI',
                accent: 'green',
                body: 'Custom Web Components for the web written in vanilla JavaScript, inspired by the design of the Frutiger Aero typeface',
                badge: 'JS',
                badgeVariant: 'success',
                source: 'https://github.com/TetteDev/tettedev.github.io/tree/main/assets/js',
            },
            {
                title: 'ImmediateGUI',
                accent: 'green',
                body: 'An immediate mode style GUI library for use in Userscripts',
                badge: 'JS',
                badgeVariant: 'success',
                source: 'https://greasyfork.org/en/scripts/535798-immediategui',
            },
        ];

        highlightedProjectData.forEach(({ title, _accent, body: bodyText, badge, badgeVariant, source }) => {
            const card = document.createElement('fa-card');
            card.setAttribute('hover', '');
            card.setAttribute('accent', 'amber');
            card.setAttribute('spotlight', 'true');

            const cardHeader = document.createElement('div');
            cardHeader.slot = 'header';
            cardHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between;';

            const cardTitle = document.createElement('fa-h3');
            cardTitle.textContent = title;
            cardHeader.appendChild(cardTitle);

            const cardBadge = document.createElement('fa-badge');
            cardBadge.setAttribute('variant', badgeVariant);
            cardBadge.textContent = badge;
            cardHeader.appendChild(cardBadge);
            card.appendChild(cardHeader);

            const cardBody = document.createElement('fa-p');
            cardBody.textContent = bodyText;
            card.appendChild(cardBody);

            if (source) {
                card.dataset.source = source;
                card.addEventListener('click', () => { card.dataset.source && window.open(card.dataset.source, "_blank") });
            }

            projectsGrid.appendChild(card);
        });

        function renderProjects(json) {
            const EXLUDE_ARCHIVED = true; // whether to exclude archived projects from the list
            const EXPLICIT_REPO_NAME_EXCLUDES = [ /* 'tettedev.github.io', */ 'TetteDev' ]; // exclude profile repo and website repo
            
            const MAX_PROJECTS = 9999; // maximum number of projects to display (after filtering and sorting)

            const ORDER_BY_UPDATED = true; // whether to order projects by last updated time (most recent first)
            const ORDER_BY_UPDATED_DESCENDING = true; // if ordering by updated time, whether to show most recently updated projects first (if false, shows least recently updated first)

            const ORDER_BY_STARS = false; // whether to order projects by stargazer count (most stars first)
            const ORDER_BY_STARS_DESCENDING = true; // if ordering by stars, whether to show projects with most stars first (if false, shows projects with least stars first)

            const ORDER_BY_WATCHERS = false; // whether to order projects by watcher count (most watchers first)
            const ORDER_BY_WATCHERS_DESCENDING = true; // if ordering by watchers, whether to show projects with most watchers first (if false, shows projects with least watchers first)

            let repos = typeof json === 'string' ? JSON.parse(json) : json;
            if (ORDER_BY_UPDATED === true) {
                repos.sort((a, b) => ORDER_BY_UPDATED_DESCENDING ? new Date(b.updated_at) - new Date(a.updated_at) : new Date(a.updated_at) - new Date(b.updated_at));
            } else if (ORDER_BY_STARS === true) {
                repos.sort((a, b) => ORDER_BY_STARS_DESCENDING ? b.stargazers_count - a.stargazers_count : a.stargazers_count - b.stargazers_count);
            } else if (ORDER_BY_WATCHERS === true) {
                repos.sort((a, b) => ORDER_BY_WATCHERS_DESCENDING ? b.watchers_count - a.watchers_count : a.watchers_count - b.watchers_count);
            }

            // clear existing non-spotlight cards just in case
            projectsGrid.querySelectorAll('fa-card').forEach(c => {
                if (!c.hasAttribute('spotlight')) c.remove();
            });

            repos = repos.slice(0, MAX_PROJECTS);
            for (const repoData of repos) {
                if (EXLUDE_ARCHIVED && repoData.archived) continue;

                const { name, description, language, html_url, updated_at, stargazers_count } = repoData;
                const { title, accent, body, badge, badgeVariant, source } = {
                    title: name,
                    accent: 'blue',
                    body: description || 'See project on GitHub for more details',
                    badge: langToShort(language) || 'Other',
                    badgeVariant: 'success',
                    source: html_url,
                    updated_at,
                    stars: stargazers_count,
                };

                if (EXPLICIT_REPO_NAME_EXCLUDES.includes(name)) continue;

                const card = document.createElement('fa-card');
                card.setAttribute('hover', '');
                card.setAttribute('accent', accent);

                const cardHeader = document.createElement('div');
                cardHeader.slot = 'header';
                cardHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between;';

                const cardTitle = document.createElement('fa-h3');
                cardTitle.textContent = title;
                cardHeader.appendChild(cardTitle);

                const cardBadge = document.createElement('fa-badge');
                cardBadge.setAttribute('variant', badgeVariant);
                cardBadge.textContent = badge;
                cardHeader.appendChild(cardBadge);
                card.appendChild(cardHeader);

                const cardBody = document.createElement('fa-p');
                cardBody.textContent = body;
                card.appendChild(cardBody);

                if (source) {
                    card.dataset.source = source;
                    card.addEventListener('click', () => {card.dataset.source && window.open(card.dataset.source, "_blank")});
                }

                projectsGrid.appendChild(card);
            }
        }
        async function fetchProjects() {
            const repoUrl = "https://api.github.com/users/TetteDev/repos";
            return fetch(repoUrl).then(res => {
                const isOk = res.ok;
                if (isOk) {
                    return res.json();
                }
                else {
                    throw new Error(`GitHub API request failed with status ${res.status}`);
                }
            });
        }
        
        const DONT_FETCH_REPOS_AUTO = true;
        const repoCacheKey = "cachedRepos";
        const cachedRepoJson = recall(repoCacheKey);
        if (cachedRepoJson) {
            renderProjects(cachedRepoJson);
        } 
        else {
            if (DONT_FETCH_REPOS_AUTO === false) {
                try {
                    fetchProjects().then(json => {
                        remember(repoCacheKey, JSON.stringify(json));
                        renderProjects(json);
                    });
                } catch (err) {
                    console.error("Error fetching repositories:", err);
                    remember(repoCacheKey, JSON.stringify([]));
                }
            }
        }

        projects.appendChild(projectsGrid);
        main.appendChild(projects);

        if (cachedRepoJson || (DONT_FETCH_REPOS_AUTO === true)) {
            const clearCacheBtn = document.createElement('fa-button');
            clearCacheBtn.setAttribute('variant', 'warning');
            clearCacheBtn.setAttribute('size', 'sm');
            const btnText = cachedRepoJson ? 'Clear Cache & Update Repositories' : 'Update Repositories';
            clearCacheBtn.textContent = btnText;
            clearCacheBtn.style.marginTop = '16px';
            clearCacheBtn.addEventListener('click', () => {
                const seconds = 61;
                const cooldownTimeMs = seconds * 1000;
                
                const confirmClear = confirm("You are about to make one (1) request to the public GitHub API (https://api.github.com/users/TetteDev/repos). Do you want to continue?");
                if (confirmClear) {
                    const backup = recall(repoCacheKey);
                    try {
                        // TODO: we need to implement a Forget function
                        forget(repoCacheKey);
                        fetchProjects().then(json => {
                            remember(repoCacheKey, JSON.stringify(json));
                            renderProjects(json);
                        });
                    } catch (err) {
                        console.warn("Error fetching repositories:", err);
                        if (backup) remember(repoCacheKey, backup);
                    } finally {
                        clearCacheBtn.setAttribute('disabled', '');
                        clearCacheBtn.textContent = `Please wait ${seconds-1} seconds before clicking again...`;

                        let secondsLeft = seconds;
                        let intervalId = setInterval(() => { 
                            if (clearCacheBtn.hasAttribute('disabled') === false || secondsLeft === 0) {
                                clearInterval(intervalId);
                                return;
                            }
                            clearCacheBtn.textContent = `Please wait ${--secondsLeft} second(s) before clicking again...`; }, 
                            Math.ceil(cooldownTimeMs / (seconds - 1))); // only to have our button show 'Any second now...' for atleast 1 second
                        setTimeout(() => { clearCacheBtn.textContent = btnText; clearCacheBtn.removeAttribute('disabled'); }, cooldownTimeMs);
                    }
                }
            });

            projects.appendChild(clearCacheBtn);
        }

        const about = document.createElement('fa-section');
        about.id = 'about';
        about.setAttribute('title', 'About me');
        about.setAttribute('accent', 'amber');

        const aboutCard = document.createElement('fa-card');
        aboutCard.setAttribute('variant', 'glass');
        aboutCard.setAttribute('padding', 'lg');

        const aboutP1 = document.createElement('fa-p');
        aboutP1.textContent = `Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.`;
        aboutCard.appendChild(aboutP1);
        about.appendChild(aboutCard);

        const didYouKnow = document.createElement('fa-section');
        didYouKnow.setAttribute('title', 'Did you know?');
        didYouKnow.setAttribute('accent', 'blue');

        const didYouKnowCard = document.createElement('fa-card');
        didYouKnowCard.setAttribute('variant', 'glass');

        const didYouKnowP1 = document.createElement('fa-p');
        didYouKnowP1.textContent = `This page used to be locked behind a small puzzle that you had to solve, but due to the fact that many users had trouble solving it and thus did not get to see my website I decided to remove it. You can still check out the puzzles via the links down below though.`;
        didYouKnowCard.appendChild(didYouKnowP1);
        didYouKnow.appendChild(didYouKnowCard);

        const puzzlesFiles = [
            { name: "Puzzle 1", path: "assets/fun/puzzle1/index.html", description: "Can you find the super secret code?" },
        ];

        const shownBigPuzzlesCount = 4;
        if (puzzlesFiles.length > 0) {
            didYouKnowCard.style.marginBottom = '24px';

            const puzzleGrid = document.createElement('fa-grid');
            puzzleGrid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px;';
            const tidyName = (input, fallbackIdx) => input || (fallbackIdx !== undefined ? `Puzzle ${fallbackIdx + 1}` : "Untitled Puzzle");

            const slice = puzzlesFiles.slice(0, shownBigPuzzlesCount); // limit to first 50 puzzles to avoid overwhelming the user
            slice.forEach(({ name, path = '', description = 'No description available', difficulty = 'Puzzle' }, idx) => {
                const puzzleCard = document.createElement('fa-card');
                puzzleCard.setAttribute('hover', '');
                puzzleCard.setAttribute('accent', 'green');

                const puzzleCardHeader = document.createElement('div');
                puzzleCardHeader.slot = 'header';
                puzzleCardHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between;';

                const puzzleCardTitle = document.createElement('fa-h3');
                puzzleCardTitle.textContent = tidyName(name, idx);
                puzzleCardHeader.appendChild(puzzleCardTitle);

                const puzzleCardBadge = document.createElement('fa-badge');
                puzzleCardBadge.setAttribute('variant', 'amber');
                puzzleCardBadge.textContent = difficulty;
                puzzleCardHeader.appendChild(puzzleCardBadge);
                puzzleCard.appendChild(puzzleCardHeader);

                const puzzleCardBody = document.createElement('fa-p');
                puzzleCardBody.textContent = description;
                puzzleCard.appendChild(puzzleCardBody);

                if (path && path.trim() !== "") puzzleCard.addEventListener('click', () => { window.open(path, "_blank"); });
                
                puzzleGrid.appendChild(puzzleCard);
            });

            didYouKnow.appendChild(puzzleGrid);

            const remainingPuzzles = puzzlesFiles.slice(slice.length);
            if (remainingPuzzles.length > 0) {
                puzzleGrid.style.marginBottom = '24px';

                const remainingPuzzleContainer = document.createElement('div');
                remainingPuzzleContainer.className = 'grid grid-2';
                remainingPuzzleContainer.style.cssText = "margin-bottom: 48px;";

                const ul = document.createElement('fa-ul');
                ul.setAttribute('variant', 'glass');
                ul.setAttribute('bullet', 'orb');
                ul.setAttribute('color', 'blue');
                ul.style.cssText = 'max-height: 400px; overflow-y: auto;';
                remainingPuzzleContainer.appendChild(ul);

                const remainingPuzzles = puzzlesFiles.slice(slice.length);
                remainingPuzzles.forEach(({ name, path = '', description = 'No description available', difficulty = 'Puzzle' }, idx) => {
                    const li = document.createElement('fa-li');
                    li.textContent = tidyName(name, idx);
                    li.style.width = '100%';
    
                    li.style.cursor = 'pointer';
                    li.addEventListener('mouseover', () => { li.style.textDecoration = 'underline'; });
                    li.addEventListener('mouseout', () => { li.style.textDecoration = 'none'; });
                    if (path && path.trim() !== "") li.addEventListener('click', () => { window.open(path, "_blank"); })

                    ul.appendChild(li);
                });
                
                didYouKnow.appendChild(remainingPuzzleContainer);
            }
        }

        main.appendChild(about);
        main.appendChild(didYouKnow);
        body.appendChild(main);

        const footer = document.createElement('fa-footer');
        footer.style.marginTop = '48px';

        const footerRight = document.createElement('span');
        footerRight.slot = 'copy';
        footerRight.textContent = `© ${new Date().getFullYear()} TetteDev`;
        footer.appendChild(footerRight);

        body.appendChild(footer);
        document.body.appendChild(body);

        // Clear whatever puzzle related elements are still present in the DOM just in case
        document.querySelectorAll('.stage1').forEach(el => { el.remove(); });

        // // Our custom FA components have already been defined and fully registered
        // // so we dont really need the script tags any more
        // document.querySelectorAll('script[src*="assets/js/fa-"]').forEach(s => s.remove());

        // // Optional: same goes for our FA stylesheet, gotta be sure though its been cached
        //document.querySelectorAll('link[href*="assets/css/fa-"]').forEach(s => s.remove());

        // Fixes small chance of our loadding message and loader still being visible after the website has loaded
        setTimeout(() => {
            document.getElementById("message")?.remove();
            document.getElementById("loader")?.remove();
            document.querySelector('script[class="stage1"]')?.remove();
        }, 500);
    }
    function RenderFallback(err) {
        document.getElementById("loader")?.remove();
        document.querySelector('script[class="stage1"]')?.remove();

        // Clear any existing FA components
        scripts.forEach(src => {
            const script = document.querySelector(`script[src="${src}"]`);
            if (script) script.remove();
        });
        stylesheets.forEach(href => {
            const styleSheetEl = document.querySelector(`link[href="${href}"]`);
            if (styleSheetEl) styleSheetEl.remove();
        });
        document.querySelectorAll('.stage1').forEach(el => { 
            el.classList.remove('stage1');
            if (el.classList.length === 0) el.removeAttribute("class");
        });

        const errorMessage = `Something went wrong :/`;
        const errorMessageTransition = `opacity 1s ease`;

        let messageElement = document.querySelector("#message");
        if (!messageElement) {
            messageElement = document.createElement('span');
            messageElement.id = "message";
            messageElement.className = 'hide';
            messageElement.style.transition = errorMessageTransition;
            messageElement.textContent = errorMessage;
            document.body.appendChild(messageElement);
            messageElement.classList.remove('hide');
        } else {
            messageElement.textContent = errorMessage;
            messageElement.style.transition = errorMessageTransition;
            messageElement.classList.remove('hide');
        }
    }
})();