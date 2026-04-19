let allowStoreDataLocally = false;
if (localStorage.getItem('local') === null) {
    localStorage.setItem('local', 'false');
}
else {
    allowStoreDataLocally = localStorage.getItem('local') === 'true';
}

let grid = document.getElementById('grid');
if (!grid) {
    grid = document.createElement('div');
    grid.id = 'grid';
    document.querySelector('main').appendChild(grid);
}

let imgTotal = allowStoreDataLocally ? localStorage.getItem('imgTotal') : null;
if (!imgTotal) {
    imgTotal = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--default-img-total').trim());
    document.documentElement.style.setProperty('--default-img-total', imgTotal);
}
let imgPerRow = allowStoreDataLocally ? localStorage.getItem('imgPerRow') : null;
if (!imgPerRow) {
    imgPerRow = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--default-img-per-row').trim());
    document.documentElement.style.setProperty('--default-img-per-row', imgPerRow);
}

class CappedSet {
    constructor(limit, initial = []) {
        this.limit = limit;
        this.set = new Set(initial);
        this.queue = Array.from(this.set);
    }
    add(value) {
        if (!this.set.has(value)) {
            if (this.set.size >= this.limit) {
                const oldest = this.queue.shift();
                this.set.delete(oldest);
            }
            this.set.add(value);
            this.queue.push(value);
        }
    }
    has(value) {
        return this.set.has(value);
    }
    delete(value) {
        if (this.set.has(value)) {
            this.set.delete(value);
            const index = this.queue.indexOf(value);
            if (index > -1) {
                this.queue.splice(index, 1);
            }
        }
    }
    toJSON() {
        return Array.from(this.set);
    }
}

const maxStoredIds = allowStoreDataLocally ? 50 : -1;
const occupiedIds = allowStoreDataLocally && localStorage.getItem('occupiedIds') ? new CappedSet(maxStoredIds, JSON.parse(localStorage.getItem('occupiedIds'))) : new CappedSet(maxStoredIds);
const imageProvider = 'imgur';
let useProxy = false;

function randomImg(contextImg, underlyingProvider = 'imgur', proxy = true) {
    const proxies = ['https://external-content.duckduckgo.com/iu/?u='];
    const supportedProviders = {
        'imgur': {
            defaultExtension: '.png',
            generateUrl: (overridExtension = null) => {
                const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                const length = 5;
                const ext = overridExtension || '.png';

                const id = Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
                if (occupiedIds.has(id)) {
                    return supportedProviders[underlyingProvider].generateUrl();
                }
                occupiedIds.add(id);
                if (allowStoreDataLocally) localStorage.setItem('occupiedIds', JSON.stringify(occupiedIds.toJSON()));

                const thumbId = id + 'b';

                const template = 'https://i.imgur.com/{id}{ext}';
                const thumnailUrl = template.replace('{id}', thumbId).replace('{ext}', ext);
                const fullsizeUrl = template.replace('{id}', id).replace('{ext}', ext);

                return {
                    thumbUrl: thumnailUrl,
                    fullsizeUrl: fullsizeUrl
                }
            },
        },
        // '9gag': {
        //     generateUrl: () => {
        //         const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        //         const length = 7;
        //         const ext = '.webp';

        //         const filenameSuffix = '_700b';
        //         const id = Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
        //         if (occupiedIds.has(id)) {
        //             return supportedProviders[underlyingProvider].generateUrl();
        //         }
        //         occupiedIds.add(id);
        //         if (allowStoreDataLocally) localStorage.setItem('occupiedIds', JSON.stringify(occupiedIds.toJSON()));

        //         const template = 'https://img-9gag-fun.9cache.com/photo/{id}{suffix}{ext}';
        //         const thumnailUrl = template.replace('{id}', id).replace('{suffix}', filenameSuffix).replace('{ext}', ext);
        //         const fullsizeUrl = template.replace('{id}', id).replace('{suffix}', '').replace('{ext}', ext);

        //         return {
        //             thumbUrl: thumnailUrl,
        //             fullsizeUrl: fullsizeUrl
        //         }
        //     },
        // },
    };

    const provider = supportedProviders[underlyingProvider];
    if (!provider) { debugger; throw new Error(`Unsupported provider: ${underlyingProvider}`); }

    const overrideExtension = null;
    const mediaUrl = provider.generateUrl(overrideExtension || provider.defaultExtension);
    const proxiedThumbnail = proxy ? proxies[0] + encodeURIComponent(mediaUrl.thumbUrl) : mediaUrl.thumbUrl;
    const proxiedFullsize = proxy ? proxies[0] + encodeURIComponent(mediaUrl.fullsizeUrl) : mediaUrl.fullsizeUrl;
    contextImg.urls = {
        thumbUrl: proxiedThumbnail,
        fullsizeUrl: proxiedFullsize,
        actualUrl: mediaUrl.fullsizeUrl
    }

    return proxiedThumbnail;
}

function onImageLoad(e) { 
    const img = e.target;
    const isImgurPlaceholder = imageProvider === 'imgur' && img.naturalWidth === 161 && img.naturalHeight === 81;
    if (isImgurPlaceholder) {
        img.src = randomImg(img, imageProvider, useProxy);
        return;
    }

    img.addEventListener('click', triggerGallery);
}
function onImageError(e) {
    const img = e.target;
    if (img.naturalWidth === 0 && img.naturalHeight === 0) {
        useProxy = true;
        img.src = randomImg(img, imageProvider, useProxy);
    }
    else {
        console.log('Image failed to load:', img.src, e);
        debugger;
    }
}

function triggerGallery(e) {
    const loadMoreImages = (count, underlyingProvider = imageProvider, proxy = useProxy) => {
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            img.className = 'thumbnail';
            img.addEventListener('load', onImageLoad, { capture: true });
            img.addEventListener('error', onImageError, { capture: true });
            img.src = randomImg(img, underlyingProvider, proxy);
            grid.appendChild(img);
        }

        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 500);
    };

    let galleryContainer = document.getElementById('gallery');
    if (!galleryContainer) {
        galleryContainer = document.createElement('div');
        galleryContainer.style.zIndex = 1000;

        const b64Placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        //galleryContainer.innerHTML = `<img src="${e.target.urls.fullsizeUrl || b64Placeholder}" loading="eager" style="z-index: 1001;">`.trim();
        galleryContainer.innerHTML = `
            <div style="z-index: 1001; ">
                <!-- <video controls autoplay style="max-width: 90vw; max-height: 90vh; z-index: 1002; display: none;"></video> -->
                <img src="${e.target.urls.fullsizeUrl || b64Placeholder}" loading="eager" style="z-index: 1002; /* display: none; */">
            </div>
        `.trim();

        const urlIsImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/.test(e.target.urls.actualUrl);
        // const urlIsVideo = /\.(mp4|webm|ogg)$/.test(e.target.urls.actualUrl);
        if (urlIsImage) {
            galleryContainer.querySelector('img').style.display = 'block';
        }
        // else if (urlIsVideo) {
        //     const videoEl = galleryContainer.querySelector('video');
        //     videoEl.style.display = 'block';
        //     videoEl.src = e.target.urls.actualUrl;
        // }

        galleryContainer.id = 'gallery';

        galleryContainer.close = () => { 
            galleryContainer.style.display = 'none'; 
            document.body.style.overflow = 'auto';
        };
        galleryContainer.show = () => { 
            galleryContainer.style.display = 'flex'; 
            document.body.style.overflow = 'hidden';
        };

        // clicking outside the image closes the gallery
        galleryContainer.addEventListener('click', (e) => {
            const isClickOnImage = e.target.tagName.toLowerCase() === 'img';
            if (!isClickOnImage) galleryContainer.close();
        });

        document.body.appendChild(galleryContainer);

        document.body.addEventListener('keyup', (e) => {
            const nextKey = 'ArrowRight';
            const prevKey = 'ArrowLeft';
            const closeGalleryKey = 'Escape';
            if (e.key === closeGalleryKey) {
                galleryContainer.close();
                return;
            }
            if (e.key !== nextKey && e.key !== prevKey) return;
            e.preventDefault();

            const activeMediaElement = grid.querySelector('img[active="true"]');
            if (!activeMediaElement) { debugger; return; }

            let currentMediaIndex = Array.from(grid.children).indexOf(activeMediaElement);
            let nextMediaIndex = null;
            let nextMediaElement = e.key === nextKey ? activeMediaElement.nextElementSibling : activeMediaElement.previousElementSibling;
            
            const preloadOffset = 3; // how many images before the end to start preloading more
            if (nextMediaElement) {
                nextMediaIndex = Array.from(grid.children).indexOf(nextMediaElement);
                const shouldProloadMore = e.key === nextKey ? (nextMediaIndex >= Array.from(grid.children).length - preloadOffset) : (nextMediaIndex <= preloadOffset);
                if (shouldProloadMore) {
                    loadMoreImages(imgPerRow, imageProvider, useProxy);
                }
            }
            else {
                if (e.key == prevKey) {}
            }

            const fullSrc = nextMediaElement ? nextMediaElement.urls.fullsizeUrl : null;

            nextMediaElement.setAttribute('active', 'true');
            activeMediaElement.removeAttribute('active');
            galleryContainer.querySelector('img').src = fullSrc;

        }, { capture: true });
    }

    const activeImg = e.target;
    const gridIndex = Array.from(grid.children).indexOf(activeImg);
    if (gridIndex === Array.from(grid.children).length - 1) { loadMoreImages(imgPerRow, imageProvider, useProxy); }

    grid.querySelectorAll('img[active="true"]').forEach(img => { img.removeAttribute('active'); });
    const galleryImg = galleryContainer.querySelector('img');
    e.target.setAttribute('active', 'true');

    galleryImg.addEventListener('load', (e) => { 
        galleryImg.style.width = e.target.naturalWidth + 'px';
        galleryImg.style.height = e.target.naturalHeight + 'px';
    });
    galleryImg.src = e.target.urls.fullsizeUrl;
    galleryContainer.show();
}

for (let i = 0; i < imgTotal; i++) {
    const img = document.createElement('img');
    img.className = 'thumbnail';
    img.addEventListener('load', onImageLoad, { capture: true });
    img.addEventListener('error', onImageError, { capture: true });

    img.loading = 'lazy';
    img.src = randomImg(img, imageProvider, useProxy);

    grid.appendChild(img);
}


