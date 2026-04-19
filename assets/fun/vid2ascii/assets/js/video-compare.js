window.addEventListener('DOMContentLoaded', function () {
  const panel = document.getElementById('videoComparePanel');
  if (!panel) return;

  const videoLeft = document.getElementById('videoLeft');
  const videoRight = document.getElementById('videoRight');
  const slider = document.getElementById('sliderHandle');
  const cycleBtn = document.getElementById('rightVideoCycleBtn');
  if (!videoLeft || !videoRight || !slider) return;
  const container = slider.parentElement;

  let dragging = false;
  let containerRect = null;

  function setSlider(percent) {
    percent = Math.max(0, Math.min(1, percent));
    const sliderWidth = slider.offsetWidth || 4;
    const px = percent * container.offsetWidth - sliderWidth / 2;
    slider.style.left = px + 'px';
    videoRight.style.clipPath = `inset(0 0 0 ${percent * 100}%)`;
  }

  function onDrag(e) {
    if (!dragging) return;
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = clientX - containerRect.left;
    let percent = x / containerRect.width;
    setSlider(percent);
  }

  slider.addEventListener('mousedown', e => {
    dragging = true;
    containerRect = container.getBoundingClientRect();
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  function syncVideos(event) {
    if (event.target.paused !== videoLeft.paused) {
      if (event.target.paused) {
        videoLeft.pause();
        videoRight.pause();
      } else {
        videoLeft.play();
        videoRight.play();
      }
    }
    if (Math.abs(videoLeft.currentTime - videoRight.currentTime) > 0.05) {
      videoLeft.currentTime = videoRight.currentTime = Math.min(videoLeft.currentTime, videoRight.currentTime);
    }
  }
  videoLeft.addEventListener('play', syncVideos);
  videoRight.addEventListener('play', syncVideos);
  videoLeft.addEventListener('pause', syncVideos);
  videoRight.addEventListener('pause', syncVideos);
  videoLeft.addEventListener('seeked', syncVideos);
  videoRight.addEventListener('seeked', syncVideos);

  if (cycleBtn) {
    const rightSources = [
      {src: 'assets/media/post.mp4', label: 'Original', poster: 'assets/media/post_poster.png'},
      {src: 'assets/media/post_alt.mp4', label: 'Alternative', poster: 'assets/media/post_alt_poster.png'},
    ];
    let current = 0;

    cycleBtn.addEventListener('click', function () {
      current = (current + 1) % rightSources.length;
      const newSrc = rightSources[current].src;
      const currentTime = Math.min(videoLeft.currentTime, videoRight.currentTime);
      const wasPaused = videoLeft.paused;
      videoRight.src = newSrc;
      videoRight.poster = rightSources[current].poster;
      videoRight.load();
      videoRight.currentTime = currentTime;
      videoLeft.currentTime = currentTime;
      if (!wasPaused) {
        videoRight.oncanplay = function () {
          videoRight.oncanplay = null;
          videoLeft.play().catch(() => {});
          videoRight.play().catch(() => {});
        };
      }
    });
  }

  let leftReady = false, rightReady = false;
  function trySyncPlay() {
    if (leftReady && rightReady) {
      videoLeft.currentTime = 0;
      videoRight.currentTime = 0;
      videoLeft.play().catch(() => {});
      videoRight.play().catch(() => {});
    }
  }
  videoLeft.addEventListener('loadedmetadata', function onMetaL() {
    videoLeft.removeEventListener('loadedmetadata', onMetaL);
    leftReady = true;
    trySyncPlay();
  });
  videoRight.addEventListener('loadedmetadata', function onMetaR() {
    videoRight.removeEventListener('loadedmetadata', onMetaR);
    rightReady = true;
    trySyncPlay();
  });

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.addEventListener('mouseenter', () => { footer.innerHTML = '<span>Made badly by <a href="https://github.com/TetteDev" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color)">TetteDev</a></span>'; });
    footer.addEventListener('mouseleave', () => { footer.innerHTML = '<span>Made by <a href="https://github.com/TetteDev" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color)">TetteDev</a></span>'; });
  }

  const seekBar = document.getElementById('seek');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const time = document.getElementById('time');
  playPauseBtn && playPauseBtn.addEventListener('click', () => {
    if (videoLeft.paused) {
      videoLeft.play().catch(() => {});
      videoRight.play().catch(() => {});
    } else {
      videoLeft.pause();
      videoRight.pause();
    }
  });
  seekBar && seekBar.addEventListener('input', () => {
    const newTime = seekBar.value;
    videoLeft.currentTime = newTime;
    videoRight.currentTime = newTime;
  });
  videoLeft.addEventListener('timeupdate', () => {
    if (seekBar) {
      if (!seekBar.max) seekBar.max = Math.round(videoLeft.duration);
      if (!seekBar.min) seekBar.min = 0;
      if (!seekBar.step) seekBar.step = 1;
      seekBar.value = Math.round(videoLeft.currentTime);
    }
    if (time) {
      const formatTime = t => {
        const minutes = Math.floor(t / 60);
        const seconds = Math.floor(t % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
      time.textContent = `${formatTime(videoLeft.currentTime)} / ${formatTime(videoLeft.duration)}`;
    }
  }, {passive: true});
  requestAnimationFrame(() => setSlider(0.5));
});
