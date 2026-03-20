window.addEventListener('DOMContentLoaded', async function () {
    const LS_KEY = () => {
        const b64 = "cw=="; // "s"
        return (() => {
            return atob(b64);
        })();
    };
    const LS_VAL = () => {
        const b64 = "YmFuYW5h"; // "banana"
        return (() => {
            return atob(b64);
        })();
    };
    const MAGIC_HASH = () => {
        const b64 = 'I0NW'; // "#CV"
        return (() => {
            return atob(b64);
        })();
    };
    
    if (localStorage.getItem(LS_KEY()) === LS_VAL() || window.location.hash === MAGIC_HASH()) {
        const scripts = [
            "assets/js/fa-data-display.js",
            "assets/js/fa-interactive.js",
            "assets/js/fa-layout.js",
            "assets/js/fa-lists-tables.js",
            "assets/js/fa-media-utility.js",
            "assets/js/fa-typography.js"
        ];
        const stylesheets = [ "assets/css/fa-design-system.css" ];

        try {
            const cls = "stage2";
            await Promise.all([
                ...stylesheets.map(href => new Promise((resolve, reject) => {
                    const styleSheetEl = document.createElement('link');
                    styleSheetEl.className = cls;
                    styleSheetEl.rel = 'stylesheet';
                    styleSheetEl.href = href;
                    styleSheetEl.onload = resolve;
                    styleSheetEl.onerror = reject;
                    // FIXME: add a timeout in-case the stylesheet doesnt load within some time interval
                    //setTimeout(() => reject(new Error(`Css load timeout: ${href}`)), 10000);
                    document.head.appendChild(styleSheetEl);
                })),
                ...scripts.map(src => new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.className = cls;
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    // FIXME: add a timeout in-case the script doesnt load within some time interval
                    //setTimeout(() => reject(new Error(`Script load timeout: ${src}`)), 10000);
                    document.head.appendChild(script);
                }
            ))]);

            document.querySelectorAll(".stage1").forEach(el => el.remove());
            Array.from(document.body.children).forEach(c => c.remove());
            renderActualSite();

            // after rendering the actual site, we can remove the puzzle components
            // as the website will continue working without them anyways now
            document.querySelectorAll(`.${cls}`).forEach(el => el.remove());
        } catch (err) {
            // one or more components for the fruitiger aero webcomponents failed to load
            document.querySelectorAll(`.${cls}`).forEach(el => el.remove());
            document.querySelectorAll(".stage1").forEach(el => el.remove());
            Array.from(document.body.children).forEach(c => c.remove());
            alert("Something went wrong trying to render the website, please come back later");
        }
        return;
    } else localStorage.clear();

    function renderActualSite() {
        document.title = "TetteDev - CV";

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
        heroP.textContent = 'Turns out there was something here after all :)';
        heroInner.appendChild(heroP);

        if (location.hash === MAGIC_HASH()) {
            const completedPuzzle = localStorage.getItem(LS_KEY()) === LS_VAL();
            if (!completedPuzzle) {
                const puzzleButton = document.createElement('fa-button');
                puzzleButton.addEventListener('click', () => { window.open("index.html", "_blank") });
                puzzleButton.setAttribute('variant', 'ghost');
                puzzleButton.setAttribute('size', 'sm');
                puzzleButton.textContent = 'Did you miss out on the puzzle?';
                heroInner.appendChild(puzzleButton);
            }
        }

        const heroCta = document.createElement('fa-button');
        heroCta.setAttribute('variant', 'primary');
        heroCta.setAttribute('size', 'lg');
        heroCta.textContent = 'Visit my GitHub';
        heroCta.addEventListener('click', () => {
            window.open("https://github.com/TetteDev", "_blank");
        });
        heroInner.appendChild(heroCta);
        hero.appendChild(heroInner);
        main.appendChild(hero);

        const projects = document.createElement('fa-section');
        projects.id = 'projects';
        projects.setAttribute('title', 'Projects');
        projects.setAttribute('accent', 'green');

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px;';

        const projectData = [
            {
                title: 'Frutiger Aero UI',
                accent: 'green',
                body: 'A custom Web Components design system inspired by the glass and nature aesthetics of early 2010s Windows. This website is using these components!',
                badge: 'Web',
                badgeVariant: 'success',
                source: '', // url
            },
            {
                title: 'Placeholder',
                accent: 'blue',
                body: 'Placeholder project description',
                badge: 'Other',
                badgeVariant: 'success',
                source: '',
            },
        ];

        projectData.forEach(({ title, accent, body: bodyText, badge, badgeVariant, source }) => {
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
            cardBody.textContent = bodyText;
            card.appendChild(cardBody);

            if (source) {
                card.dataset.source = source;
                card.addEventListener('click', () => {card.dataset.source && window.open(card.dataset.source, "_blank")});
            }

            grid.appendChild(card);
        });

        projects.appendChild(grid);
        main.appendChild(projects);

        const about = document.createElement('fa-section');
        about.id = 'about';
        about.setAttribute('title', 'About me');
        about.setAttribute('accent', 'amber');

        const aboutCard = document.createElement('fa-card');
        aboutCard.setAttribute('variant', 'glass');
        aboutCard.setAttribute('padding', 'lg');

        const aboutP1 = document.createElement('fa-p');
        aboutP1.textContent = `Bla bla bla about me`;
        aboutCard.appendChild(aboutP1);

        const spacer = document.createElement('fa-spacer');
        spacer.setAttribute('size', 'md');
        aboutCard.appendChild(spacer);

        if (!(location.hash === MAGIC_HASH() && localStorage.getItem(LS_KEY()) !== LS_VAL())) {
            const resetBtn = document.createElement('fa-button');
            resetBtn.setAttribute('variant', 'ghost');
            resetBtn.setAttribute('size', 'sm');
            resetBtn.textContent = 'Reset puzzle';
            resetBtn.style.marginTop = '24px';
            resetBtn.addEventListener('click', () => {
                localStorage.removeItem(LS_KEY(), true);
                location.reload();
            });
            aboutCard.appendChild(resetBtn);
        }
        
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
    }

    // Delay before showing the puzzle (in ms)
    const PUZZLE_REVEAL_DELAY = 10000; // FIXME: when we publish this should be changed to some higher value

    const puzzleContainer = document.createElement('div');
    puzzleContainer.style.position = 'fixed';
    puzzleContainer.style.top = '0';
    puzzleContainer.style.left = '0';
    puzzleContainer.style.width = '100vw';
    puzzleContainer.style.height = '100vh';
    puzzleContainer.style.display = 'flex';
    puzzleContainer.style.flexDirection = 'column';
    puzzleContainer.style.justifyContent = 'center';
    puzzleContainer.style.alignItems = 'center';
    puzzleContainer.style.background = 'rgba(255,255,255,0.97)';
    puzzleContainer.style.zIndex = '9999';
    puzzleContainer.style.transition = 'opacity 0.7s';
    puzzleContainer.style.opacity = '0';
    puzzleContainer.style.pointerEvents = 'none';

    const introMsg = document.createElement('div');
    introMsg.textContent = 'You know what? There might be something here after all...';
    introMsg.style.fontSize = '1.5rem';
    introMsg.style.marginBottom = '2rem';
    introMsg.style.opacity = '0';
    introMsg.style.transition = 'opacity 0.7s';
    puzzleContainer.appendChild(introMsg);

    const magnifier = document.createElement('div');
    magnifier.innerHTML = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="21" cy="21" r="16" stroke="#333" stroke-width="3"/><line x1="34.0711" y1="34.4853" x2="44" y2="44" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>';
    magnifier.style.cursor = 'pointer';
    magnifier.style.opacity = '0';
    magnifier.style.transition = 'opacity 0.7s';
    magnifier.style.marginBottom = '1.5rem';
    magnifier.title = 'Reveal the riddle';
    puzzleContainer.appendChild(magnifier);

    const riddle = document.createElement('div');
    riddle.textContent = `Annoyingly enough, it seems whatever is hiding on this page is protected by a super secret password :/`;
    riddle.style.fontSize = '1.2rem';
    riddle.style.marginBottom = '1rem';
    riddle.style.opacity = '0';
    riddle.style.transition = 'opacity 0.7s';
    riddle.style.maxWidth = '400px';
    riddle.style.textAlign = 'center';
    puzzleContainer.appendChild(riddle);

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.placeholder = 'Your answer...';
    answerInput.style.fontSize = '1rem';
    answerInput.style.padding = '0.5rem';
    answerInput.style.border = '1px solid #aaa';
    answerInput.style.borderRadius = '4px';
    answerInput.style.marginBottom = '1rem';
    answerInput.style.opacity = '0';
    answerInput.style.transition = 'opacity 0.7s';
    answerInput.style.outline = 'none';
    answerInput.style.width = '220px';
    puzzleContainer.appendChild(answerInput);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Unlock Secret';
    submitBtn.style.fontSize = '1rem';
    submitBtn.style.padding = '0.5rem 1.2rem';
    submitBtn.style.border = 'none';
    submitBtn.style.borderRadius = '4px';
    submitBtn.style.background = '#333';
    submitBtn.style.color = '#fff';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.opacity = '0';
    submitBtn.style.transition = 'opacity 0.7s';
    puzzleContainer.appendChild(submitBtn);

    const feedback = document.createElement('div');
    feedback.style.fontSize = '1rem';
    feedback.style.marginTop = '0.5rem';
    feedback.style.color = '#b00';
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.7s';
    puzzleContainer.appendChild(feedback);

    const secret = document.createElement('div');
    secret.style.fontSize = '1.2rem';
    secret.style.marginTop = '2rem';
    secret.style.color = '#0a0';
    secret.style.opacity = '0';
    secret.style.transition = 'opacity 0.7s';
    secret.style.textAlign = 'center';
    puzzleContainer.appendChild(secret);

    document.body.appendChild(puzzleContainer);

    setTimeout(() => {
        document.title = "I lied.";
        puzzleContainer.style.opacity = '1';
        puzzleContainer.style.pointerEvents = 'auto';
        setTimeout(() => {
            document.getElementById("message")?.remove();
            introMsg.style.opacity = '1';
            magnifier.style.opacity = '1';
        }, 400);
    }, PUZZLE_REVEAL_DELAY);

    const DELAY_UNTIL_FIRST_HINT = 10000; // FIXME: when we publish this should be changed to some higher value
    const popHint = () => {
        // FIXME: this should throttled so that all hints cannot be shown immediately
        // by calling hint multiple times in quick succession

        if (HINTS.length > 0) {
            const hintFunc = HINTS.pop();
            window.hint = hintFunc;
        }
        else {
            riddle.textContent = "No more hints! Try to think outside the box :)";
        }
    }
    const HINTS = [
        () => {
            riddle.textContent = "Hmm, what happens if you call the 'checkAnswer' function in the console?"; 
            window["checkAnswer"] = function() { console.error("Try calling this functions .toString() method instead"); riddle.textContent = "An error? Perhaps the error message can provide some insight..."; };

            window["checkAnswer"].toString = function(plain = undefined) {
                if (plain === undefined) {
                    try {
                        riddle.innerHTML = `This sure looks a lot more readable! Maybe there is an easy way to <b>eval</b>uate that code and get the answer?`;
                    } catch (err) {
                        riddle.textContent = `This sure looks a lot more readable! Maybe there is an easy way to eval that code and get the answer?`;
                    }
                }
                return'\x28\x66\x75\x6e\x63\x74\x69\x6f\x6e\x20\x73\x6f\x6c\x75\x74\x69\x6f\x6e\x28\x29\x20\x7b\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x6e\x20\x3d\x20\x32\x35\x36\x3b\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x20\x78\x28\x29\x20\x7b\x20\x72\x65\x74\x75\x72\x6e\x20\x6e\x61\x76\x69\x67\x61\x74\x6f\x72\x2e\x75\x73\x65\x72\x41\x67\x65\x6e\x74\x2e\x6c\x65\x6e\x67\x74\x68\x20\x25\x20\x6e\x3b\x20\x7d\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x63\x6f\x6e\x73\x74\x20\x70\x31\x20\x3d\x20\x5b\x34\x30\x2c\x20\x34\x36\x5d\x3b\x20\x63\x6f\x6e\x73\x74\x20\x70\x32\x20\x3d\x20\x5b\x33\x37\x5d\x3b\x20\x63\x6f\x6e\x73\x74\x20\x70\x33\x20\x3d\x20\x5b\x33\x34\x5d\x3b\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x72\x65\x74\x75\x72\x6e\x20\x53\x74\x72\x69\x6e\x67\x2e\x66\x72\x6f\x6d\x43\x68\x61\x72\x43\x6f\x64\x65\x28\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x70\x31\x5b\x30\x5d\x20\x5e\x20\x78\x28\x29\x2c\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x70\x31\x5b\x31\x5d\x20\x5e\x20\x78\x28\x29\x2c\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x70\x32\x5b\x30\x5d\x20\x5e\x20\x78\x28\x29\x2c\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x70\x33\x5b\x30\x5d\x20\x5e\x20\x78\x28\x29\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x29\x3b\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x7d\x29\x28\x29'; 
            };
            const oEval = window.eval;
            window.eval = function(code, force = false) { 
                if (typeof code !== 'string' || force === true) return oEval.apply(this, arguments);
                const src = window.checkAnswer.toString(true);
                if (code.trim() === src.trim()) { 
                    riddle.textContent = "Now this for sure looks like a super secret password to me: " + window.eval(code, true).toLowerCase();
                    return undefined; 
                }
                return oEval.apply(this, arguments);
            };
        },
        () => { riddle.textContent = "Seems some parts of that file might have been intentionally obfuscated, perhaps to hide something important?"; popHint(); },
        () => { riddle.textContent = "Doesnt hurt checking out the jquery file"; popHint(); }
    ];
    const HINT_COUNT = HINTS.length;

    magnifier.addEventListener('click', function () {
        riddle.style.opacity = '1';
        magnifier.style.display = 'none';
        answerInput.style.opacity = '1';
        submitBtn.style.opacity = '1';
        feedback.style.opacity = '0';
        secret.style.opacity = '0';
        answerInput.value = '';
        introMsg.remove();
        setTimeout(() => {
            if (HINTS.length === HINT_COUNT) { 
                riddle.textContent = "Perhaps the function 'hint' in the window object can help?";
            }
            popHint();
        }, DELAY_UNTIL_FIRST_HINT);
        setTimeout(() => {
            answerInput.focus();

        }, 300);
    });

    function _0xcf7c(){const _0x2a2efc=['\x6e\x64\x65\x32\x6d\x5a\x6d\x58\x6f\x77\x66\x4c\x45\x4e\x62\x66\x44\x71','\x6d\x5a\x43\x33\x6d\x5a\x43\x59\x6e\x30\x39\x6e\x44\x68\x4c\x58\x77\x47','\x42\x67\x76\x55\x7a\x33\x72\x4f','\x6d\x4c\x7a\x4d\x42\x78\x44\x7a\x41\x61','\x43\x67\x39\x50\x42\x4e\x72\x4c\x43\x4b\x76\x32\x7a\x77\x35\x30\x43\x57','\x6e\x4a\x47\x57\x6e\x74\x47\x34\x41\x75\x72\x67\x77\x68\x6a\x62','\x71\x32\x39\x55\x7a\x33\x6a\x48\x44\x68\x76\x53\x79\x78\x72\x50\x42\x32\x35\x5a\x69\x73\x62\x71\x43\x4d\x76\x57\x79\x78\x6a\x50\x42\x4d\x43\x47\x44\x67\x48\x4c\x69\x68\x6e\x4c\x79\x33\x6a\x4c\x44\x63\x62\x4a\x42\x32\x35\x30\x7a\x77\x35\x30\x6c\x49\x34\x55','\x73\x77\x35\x4a\x42\x33\x6a\x59\x7a\x77\x6e\x30\x6c\x49\x62\x75\x43\x4e\x4b\x47\x79\x77\x44\x48\x41\x77\x34\x48','\x6d\x5a\x47\x5a\x6d\x74\x48\x68\x44\x77\x6e\x7a\x7a\x30\x71','\x43\x4d\x76\x53\x42\x32\x66\x4b','\x6d\x74\x69\x57\x6e\x4c\x66\x78\x74\x4d\x31\x6b\x44\x47','\x6e\x74\x69\x32\x6d\x64\x69\x32\x6e\x65\x48\x5a\x7a\x4c\x76\x6b\x42\x61','\x42\x33\x62\x48\x79\x32\x4c\x30\x45\x71','\x43\x33\x72\x35\x42\x67\x75','\x44\x67\x39\x6d\x42\x33\x44\x4c\x43\x4b\x6e\x48\x43\x32\x75','\x44\x67\x39\x6d\x42\x32\x6e\x48\x42\x67\x76\x6d\x42\x33\x44\x4c\x43\x4b\x6e\x48\x43\x32\x75','\x44\x67\x76\x34\x44\x65\x6e\x56\x42\x4e\x72\x4c\x42\x4e\x71','\x6e\x74\x4b\x35\x6e\x64\x79\x30\x6d\x68\x76\x32\x45\x67\x31\x76\x41\x61','\x44\x68\x6a\x50\x42\x71','\x43\x32\x76\x30\x73\x78\x72\x4c\x42\x71','\x6f\x74\x47\x57\x6f\x74\x61\x30\x6d\x65\x72\x66\x74\x4e\x48\x6e\x73\x57'];_0xcf7c=function(){return _0x2a2efc;};return _0xcf7c();}function _0x3745(_0x2999eb,_0x144a96){_0x2999eb=_0x2999eb-0xfe;const _0xcf7c96=_0xcf7c();let _0x37455a=_0xcf7c96[_0x2999eb];if(_0x3745['\x4d\x44\x46\x47\x70\x4b']===undefined){var _0x120b79=function(_0xc2ed18){const _0xdd5274='\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x2b\x2f\x3d';let _0x2e8dc9='',_0x11fcee='';for(let _0xff84e2=0x0,_0x1cba3c,_0x560aa,_0x527d4f=0x0;_0x560aa=_0xc2ed18['\x63\x68\x61\x72\x41\x74'](_0x527d4f++);~_0x560aa&&(_0x1cba3c=_0xff84e2%0x4?_0x1cba3c*0x40+_0x560aa:_0x560aa,_0xff84e2++%0x4)?_0x2e8dc9+=String['\x66\x72\x6f\x6d\x43\x68\x61\x72\x43\x6f\x64\x65'](0xff&_0x1cba3c>>(-0x2*_0xff84e2&0x6)):0x0){_0x560aa=_0xdd5274['\x69\x6e\x64\x65\x78\x4f\x66'](_0x560aa);}for(let _0x561170=0x0,_0x1de70f=_0x2e8dc9['\x6c\x65\x6e\x67\x74\x68'];_0x561170<_0x1de70f;_0x561170++){_0x11fcee+='\x25'+('\x30\x30'+_0x2e8dc9['\x63\x68\x61\x72\x43\x6f\x64\x65\x41\x74'](_0x561170)['\x74\x6f\x53\x74\x72\x69\x6e\x67'](0x10))['\x73\x6c\x69\x63\x65'](-0x2);}return decodeURIComponent(_0x11fcee);};_0x3745['\x68\x64\x44\x4c\x57\x6e']=_0x120b79,_0x3745['\x45\x6b\x74\x65\x61\x4e']={},_0x3745['\x4d\x44\x46\x47\x70\x4b']=!![];}const _0x2c4ce9=_0xcf7c96[0x0],_0x440e8c=_0x2999eb+_0x2c4ce9,_0x23fcb4=_0x3745['\x45\x6b\x74\x65\x61\x4e'][_0x440e8c];return!_0x23fcb4?(_0x37455a=_0x3745['\x68\x64\x44\x4c\x57\x6e'](_0x37455a),_0x3745['\x45\x6b\x74\x65\x61\x4e'][_0x440e8c]=_0x37455a):_0x37455a=_0x23fcb4,_0x37455a;}(function(_0x109bf3,_0x2a6212){const _0x57f1bb=_0x3745,_0x566b8b=_0x109bf3();while(!![]){try{const _0x53b1ad=-parseInt(_0x57f1bb(0x111))/0x1+-parseInt(_0x57f1bb(0x10f))/0x2*(parseInt(_0x57f1bb(0x10d))/0x3)+parseInt(_0x57f1bb(0x102))/0x4+parseInt(_0x57f1bb(0x108))/0x5+-parseInt(_0x57f1bb(0x101))/0x6*(-parseInt(_0x57f1bb(0xff))/0x7)+-parseInt(_0x57f1bb(0x10b))/0x8+parseInt(_0x57f1bb(0x10c))/0x9;if(_0x53b1ad===_0x2a6212)break;else _0x566b8b['push'](_0x566b8b['shift']());}catch(_0x329e18){_0x566b8b['push'](_0x566b8b['shift']());}}}(_0xcf7c,0xdeb68));const checkAnswer=function(){return((()=>{const _0xe1022a=_0x3745,_0x2e8dc9=answerInput['\x76\x61\x6c\x75\x65'][_0xe1022a(0x109)]()[_0xe1022a(0x105)]();function _0x11fcee(){const _0x1ef8ea=_0xe1022a;return navigator['\x75\x73\x65\x72\x41\x67\x65\x6e\x74'][_0x1ef8ea(0x10e)]%0x100;}const _0xff84e2=[0x28,0x2e],_0x1cba3c=[0x25],_0x560aa=[0x22],_0x527d4f=String['\x66\x72\x6f\x6d\x43\x68\x61\x72\x43\x6f\x64\x65'](_0xff84e2[0x0]^_0x11fcee(),_0xff84e2[0x1]^_0x11fcee(),_0x1cba3c[0x0]^_0x11fcee(),_0x560aa[0x0]^_0x11fcee());_0x2e8dc9===_0x527d4f[_0xe1022a(0x106)]()?(localStorage[_0xe1022a(0x10a)](LS_KEY(),LS_VAL()),feedback['\x73\x74\x79\x6c\x65'][_0xe1022a(0x103)]='\x30',secret['\x74\x65\x78\x74\x43\x6f\x6e\x74\x65\x6e\x74']=_0xe1022a(0x112),secret['\x73\x74\x79\x6c\x65'][_0xe1022a(0x103)]='\x31',setTimeout(()=>{const _0x5dd054=_0xe1022a;puzzleContainer[_0x5dd054(0x104)][_0x5dd054(0x103)]='\x30',puzzleContainer[_0x5dd054(0x104)][_0x5dd054(0x110)]='\x6e\x6f\x6e\x65',location[_0x5dd054(0x100)]();},0xdac)):(feedback[_0xe1022a(0x107)]=_0xe1022a(0xfe),feedback[_0xe1022a(0x104)][_0xe1022a(0x103)]='\x31',secret[_0xe1022a(0x104)]['\x6f\x70\x61\x63\x69\x74\x79']='\x30');})());};

    try {
        Object.defineProperty(checkAnswer, 'toString', {
            value: function() { return 'function checkAnswer() { [native code] }'; },
            writable: false,
            configurable: false,
            enumerable: false
        });
    } catch (e) {}

    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keyup', function (e) { if (e.key === 'Enter') { checkAnswer(); } });
}, { once: true });