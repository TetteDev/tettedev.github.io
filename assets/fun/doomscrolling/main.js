let settings = {};
const _isLocalStorageEnabled = (defaultValue = false) => {
    const ls_key = 'local';
    const storedValue = localStorage.getItem(ls_key);
    if (storedValue !== null) {
        return storedValue === 'true';
    } else {
        return defaultValue;
    }
};
const _loadMoreThreshold = (defaultValue = 2) => {
    if (!settings.isLocalStorageEnabled()) return defaultValue;

    const ls_key = 'loadMoreThreshold';
    const storedValue = localStorage.getItem(ls_key);
    if (storedValue !== null) {
        const parsedValue = parseInt(storedValue, 10);
        return parsedValue;
    }
    else {
        return defaultValue;
    }
};
const _badImageIds = (defaultValue = []) => {
    return new Promise((resolve, reject) => {
        // console.warn('settings.badImageIds() is explicitly disabled')
        // return resolve([]);

        if (!settings.isLocalStorageEnabled()) return resolve(defaultValue);

        const indexedDbKey = document.querySelector('#opts button[data-db-key]')?.getAttribute('data-db-key') || 'badImageIds';
        let openRequest = indexedDB.open(indexedDbKey, 1);
        openRequest.onupgradeneeded = function() {
            const db = openRequest.result;
            if (!db.objectStoreNames.contains(indexedDbKey)) {
                db.createObjectStore(indexedDbKey, { keyPath: 'id' });
            }
        };
        openRequest.onsuccess = function() {
            const db = openRequest.result;
            const transaction = db.transaction(indexedDbKey, 'readonly');
            const store = transaction.objectStore(indexedDbKey);
            const getAllRequest = store.getAll();
            getAllRequest.onsuccess = function() {
                const result = getAllRequest.result.map(item => item.id);
                resolve(result);
            };
            getAllRequest.onerror = function() {
                reject(new Error('Failed to get all bad image IDs'));
            };
        };
        openRequest.onerror = function() {
            reject(new Error('Failed to open IndexedDB'));
        };
    });
};
_badImageIds.addId = function(id) {
    if (!settings.isLocalStorageEnabled()) return;

    const indexedDbKey = document.querySelector('#opts button[data-db-key]')?.getAttribute('data-db-key') || 'badImageIds';
    let openRequest = indexedDB.open(indexedDbKey, 1);
    openRequest.onupgradeneeded = function() {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(indexedDbKey)) {
            db.createObjectStore(indexedDbKey, { keyPath: 'id' });
        }
    };
    openRequest.onsuccess = function() {
        const db = openRequest.result;
        const transaction = db.transaction(indexedDbKey, 'readwrite');
        const store = transaction.objectStore(indexedDbKey);

        if (Array.isArray(id)) {
            id.forEach(singleId => {
                store.put({ id: singleId });
            });
        }
        else {
            store.put({ id: id });
        }
    };
    openRequest.onerror = function() {
        console.error('Failed to open IndexedDB to add bad image ID');
    };
};

settings = {
    'isLocalStorageEnabled': _isLocalStorageEnabled,
    'loadMoreThreshold': _loadMoreThreshold,
    'badImageIds': _badImageIds,
};
document.querySelector('#isLocalStorageEnabled').checked = localStorage.getItem(document.querySelector('#isLocalStorageEnabled').getAttribute('data-ls-key')) === 'true';
document.querySelector('#isLocalStorageEnabled').addEventListener('change', (e) => {
    const input = e.currentTarget;
    const value = input.checked;
    const ls_key = input.getAttribute('data-ls-key');
    localStorage.setItem(ls_key, JSON.stringify(value));
    debugger;
});
document.querySelectorAll('#opts .setting').forEach(opt => {
    if (opt.hasAttribute('skip')) return;

    const input = opt.querySelector('input');
    const functionName = input.getAttribute('data-fn');
    const lsKey = input.getAttribute('data-ls-key');
    const defaultValue = input.getAttribute('data-default-value');

    const storedValue = settings.isLocalStorageEnabled() ? localStorage.getItem(lsKey) : null;
    if (input.type === 'checkbox') {
        input.checked = storedValue || defaultValue === 'true';
    } else {
        input.value = storedValue || defaultValue;
    }

    settings[functionName] = function(e) {
        if (!settings.isLocalStorageEnabled()) return JSON.parse(defaultValue);
        const storedValue = localStorage.getItem(lsKey);

        if (storedValue !== null) {
            return JSON.parse(storedValue);
        } else {
            return JSON.parse(defaultValue);
        }
    };
    settings[functionName].set = function (newValue) {
        // TODO: new value still needs to be used for this session even if localStorage is disabled

        if (!settings.isLocalStorageEnabled()) return;
        localStorage.setItem(lsKey, newValue);
    };

    input.addEventListener('change', (e) => {
        const value = input.type === 'checkbox' ? input.checked : input.value;
        settings[functionName].set(value);
    });
});

const memes = document.getElementById('grid');
memes.addImages = function(count, eager = false) {
    const PLACEHOLDERS_ONLY = false; 

    const makeImage = (overrideSrc = null) => {
        const img = document.createElement('img');
        img.className = 'thumbnail';
        if (!PLACEHOLDERS_ONLY) img.loading = eager ? 'eager' : 'lazy';

        if (PLACEHOLDERS_ONLY) {
            const src = 'dev/image.png';
            img.urls = { base: src, proxied: src, proxiedFullsize: src };
            img.src = src;
            img.style.opacity = '1';
            memes.includeInGallery(img);
            return img;
        }

        if (overrideSrc) {
            img.urls = { base: overrideSrc, proxied: overrideSrc, proxiedFullsize: overrideSrc };
            img.src = overrideSrc;
        }
        else {
            const suffix = 'b';
            const id = memoizedGenerateId();
            const base = `https://i.imgur.com/${id}${suffix}.png`;
            const url = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(base)}`
            const proxiedFullsize = `https://external-content.duckduckgo.com/iu/?u=${`https://i.imgur.com/${id}.png`}`;
            img.urls = { base: base, proxied: url, proxiedFullsize: proxiedFullsize };

            img.reload = function(e) {
                const self = e.currentTarget || this || img;
                const eventType = e.type;
                if (eventType === 'error') {
                    // remember "bad" id's between sessions
                    const badId = settings.isLocalStorageEnabled() ? self.id : null;
                    if (badId) settings.badImageIds.addId(badId);
                    
                    self.retryCount = (self.retryCount || 0) + 1;
                    if (self.retryCount > settings.maxRetries()) {
                        self.remove();

                        // weird grid random growing issue comes from here
                        // self.src = 'dev/image.png';
                        // self.title = `Failed to generate a valid image after ${settings.maxRetries()} attempts. You can increase the retry limit via the settings if needed.`;
                        return;
                    }

                    const newId = memoizedGenerateId();
                    const newBase = `https://i.imgur.com/${newId}${suffix}.png`;
                    const proxiedThumbnail = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(newBase)}`;
                    const proxiedFullsize = `https://external-content.duckduckgo.com/iu/?u=${`https://i.imgur.com/${newId}.png`}`;
                    self.urls = { base: newBase, proxiedThumbnail: proxiedThumbnail, proxiedFullsize: proxiedFullsize };
                    self.src = settings.isProxyEnabled() ? proxiedThumbnail : newBase;
                } else if (eventType === 'load') {
                    const invalidImageEvaluators = [
                        (img) => img.naturalWidth === 161 && img.naturalHeight === 81, // common "image not found" placeholder dimensions
                    ];
                    const isInvalid = invalidImageEvaluators.some(evaluator => evaluator(self));
                    if (isInvalid) {
                        img.reload({ type: 'error', currentTarget: self });
                        return;
                    }

                    self.removeEventListener('load', self.reload, { capture: true });
                    self.removeEventListener('error', self.reload, { capture: true });
                    memes.includeInGallery(self);
                }
            };

            img.addEventListener('error', img.reload, { capture: true });
            img.addEventListener('load', img.reload, { capture: true });
            img.id = id;
            img.src = overrideSrc || (settings.isProxyEnabled() ? url : base) || 'dev/image.png';
        }

        return img;
    };

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const img = makeImage();
        fragment.appendChild(img);
    }
    this.appendChild(fragment);
};
memes.includeInGallery = function(img) {
    let overlay = null;

    const initGallery = () => {
        overlay = document.createElement('div');
        overlay.id = 'gallery';
        
        const placeholderBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PuXrGQAAAABJRU5ErkJggg==';
        overlay.insertAdjacentHTML('beforeend', `<img src="${placeholderBase64}" loading="eager"></img>`);

        document.body.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight') nextImg();
            else if (e.key === 'ArrowLeft') prevImg();
            else if (e.key === 'Escape') hideGallery();
        }, { capture: true });

        const makeElementZoomable = (element) => {
            element.scale = 1;

            if (element.getAttribute('data-zoomable') === 'true') {
                element.scale = 1;
                element.style.transformOrigin = 'center center'; // reset the transform origin
                element.style.transform = 'scale(1)'; // reset the zoom
                return;
            }
            element.setAttribute('data-zoomable', 'true');

            const zoomStep = 0.1;
            element.parentElement.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.deltaY < 0) {
                    element.scale += zoomStep;
                }
                else {
                    element.scale = Math.max(zoomStep, element.scale - zoomStep);
                }
                
                element.style.transformOrigin = `${e.offsetX}px ${e.offsetY}px`; // zoom towards the cursor position
                element.style.transform = `scale(${element.scale})`;
            });
        };
        makeElementZoomable(overlay.querySelector('img'));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideGallery();
            makeElementZoomable(overlay.querySelector('img'));
        });
        document.body.appendChild(overlay); 
    };
    const hideGallery = () => { 
        overlay.style.display = 'none';

        memes.querySelectorAll('img').forEach(img => { if (img.hasAttribute('active')) img.removeAttribute('active'); });
    };
    const triggerGallery = (e) => { 
        overlay.style.display = 'flex'; 

        memes.querySelectorAll('img').forEach(img => { if (img.hasAttribute('active')) img.removeAttribute('active'); });
        img.setAttribute('active', 'true');

        const activeImageIndex = Array.from(memes.children).indexOf(img);
        if (activeImageIndex >= memes.children.length - _loadMoreThreshold()) {
            memes.addImages(settings.loadMoreImagesCount(), true /* eager */);
            //requestAnimationFrame(() => { img.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
        }

        const galleryImg = overlay.querySelector('img');
        galleryImg.addEventListener('load', (e) => {
            galleryImg.style.maxWidth = '90vw';
            galleryImg.style.maxHeight = '90vh';
        }, { once: true });

        galleryImg.style.transform = 'scale(1)';
        galleryImg.reference = img;
        galleryImg.src = img.urls.proxiedFullsize; 
    };
    const nextImg = () => {
        overlay.querySelector('img').style.transform = 'scale(1)';

        const active = memes.querySelector('img[active="true"]');
        let rightSibling = active && active.nextElementSibling;
        if (rightSibling) {
            if (rightSibling.retryCount && rightSibling.retryCount > settings.maxRetries()) { 
                debugger;
            }
            else {
                const rightSiblingIndex = Array.from(memes.children).indexOf(rightSibling);
                if (rightSiblingIndex >= memes.children.length - _loadMoreThreshold()) memes.addImages(settings.loadMoreImagesCount(), true /* eager */);
                rightSibling.click();
                //requestAnimationFrame(() => { rightSibling.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
            }
        }
    };
    const prevImg = () => { 
        overlay.querySelector('img').style.transform = 'scale(1)';

        const active = memes.querySelector('img[active="true"]');
        const leftSibling = active.previousElementSibling;
        if (leftSibling) leftSibling.click();
    };

    if (document.getElementById('gallery')) {
        overlay = document.getElementById('gallery');
    } else {
        initGallery();
    }

    img.addEventListener('click', triggerGallery);
    const galleryImgInner = overlay.querySelector('img');
    img.style.opacity = '1';
};

let idCache = null;
settings.badImageIds().then(badIds => {
    if (badIds.length === 0) idCache = new Set();
    else {
        let storedBadIds = [...new Set(badIds)];
        idCache = new Set(storedBadIds);
    }
    memes.addImages(settings.totalCountImages());
});
function memoizedGenerateId() {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 5;
    const generate = () => Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");

    let id = generate();
    while (idCache.has(id)) {
        debugger;
        id = generate();
    }
    return id;
}