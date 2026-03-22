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
        await Promise.all([
            ...stylesheets.map(href => new Promise((resolve, reject) => {
                const styleSheetEl = document.createElement('link');
                styleSheetEl.rel = 'stylesheet';
                styleSheetEl.href = href;
                styleSheetEl.onload = resolve;
                styleSheetEl.onerror = reject;
                /* JS_PARSER.PY - OMITTED DEBUG CODE */
                document.head.appendChild(styleSheetEl);
            })),
            ...scripts.map(src => new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                /* JS_PARSER.PY - OMITTED DEBUG CODE */
                document.head.appendChild(script);
            }
        ))]);

        /* JS_PARSER.PY - OMITTED DEBUG CODE */

        RenderWebsite();
    } catch (err) {
        RenderFallback(err);
    }

    function RenderWebsite() {
        if (location.hash === "#CV") history?.replaceState(null, null, location.pathname);
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

        const projects = document.createElement('fa-section');
        projects.id = 'projects';
        projects.setAttribute('title', 'Some of my projects');
        projects.setAttribute('accent', 'green');

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px;';

        const langToShort = (full) => {
            switch (full) {
                case "JavaScript": return "JS";
                case "TypeScript": return "TS";
                default: return full;
            }
        };

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

            grid.appendChild(card);
        });

        function renderProjects(json) {
            const EXLUDE_ARCHIVED = true; // whether to exclude archived projects from the list
            const EXPLICIT_IGNORES = [ 'tettedev.github.io', 'TetteDev' ]; // exclude profile repo and website repo

            const ORDER_BY_UPDATED = false; // whether to order projects by last updated time (most recent first) instead of stargazer count
            const ORDER_BY_STARS = true; // whether to order projects by stargazer count (most stars first)

            const repos = typeof json === 'string' ? JSON.parse(json) : json;
            if (ORDER_BY_UPDATED === true) {
                repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            } else if (ORDER_BY_STARS === true) {
                repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            }

            grid.querySelectorAll('fa-card').forEach(c => {
                if (!c.hasAttribute('spotlight')) c.remove();
            });

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

                if (EXPLICIT_IGNORES.includes(name)) continue;

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

                grid.appendChild(card);
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
        const cachedRepoJson = localStorage.getItem(repoCacheKey);
        if (cachedRepoJson) {
            renderProjects(cachedRepoJson);
        } 
        else {
            if (DONT_FETCH_REPOS_AUTO === false) {
                try {
                    fetchProjects().then(json => {
                        localStorage.setItem(repoCacheKey, JSON.stringify(json));
                        renderProjects(json);
                    });
                } catch (err) {
                    console.error("Error fetching repositories:", err);
                    localStorage.setItem(repoCacheKey, JSON.stringify([]));
                }
            }
        }

        projects.appendChild(grid);
        main.appendChild(projects);

        if (cachedRepoJson || (DONT_FETCH_REPOS_AUTO === true)) {
            const clearCacheBtn = document.createElement('fa-button');
            clearCacheBtn.setAttribute('variant', 'warning');
            clearCacheBtn.setAttribute('size', 'sm');
            clearCacheBtn.textContent = cachedRepoJson ? 'Invalidate Repository Cache' : 'Fetch Repositories';
            clearCacheBtn.style.marginTop = '16px';
            clearCacheBtn.addEventListener('click', () => {
                const confirmClear = confirm("You are about to make one (1) request to the public GitHub API. Data will be cached for future visits but there is still a chance you can get rate limited if you click this button multiple times. Do you want to proceed?");
                if (confirmClear) {
                    const backup = localStorage.getItem(repoCacheKey);
                    try {
                        localStorage.removeItem(repoCacheKey);
                        fetchProjects().then(json => {
                            localStorage.setItem(repoCacheKey, JSON.stringify(json));
                            renderProjects(json);
                        });
                    } catch (err) {
                        console.error("Error clearing cache:", err);
                        if (backup) localStorage.setItem(repoCacheKey, backup);
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
        main.appendChild(about);

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

        // Optional
        //document.querySelectorAll('script[src^="assets/js/fa-"]').forEach(s => { s.remove(); });
    }
    function RenderFallback(err) {
        document.getElementById("loader")?.remove();

        // Clear any existing frutiger aero style related
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