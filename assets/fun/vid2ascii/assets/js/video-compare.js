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
      {src: 'assets/media/post.mp4', label: 'Original'},
      {src: 'assets/media/post_alt.mp4', label: 'Alternative'}
    ];
    let current = 0;

    cycleBtn.addEventListener('click', function () {
      current = (current + 1) % rightSources.length;
      const newSrc = rightSources[current].src;
      const currentTime = Math.min(videoLeft.currentTime, videoRight.currentTime);
      const wasPaused = videoLeft.paused;
      videoRight.src = newSrc;
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
      //cycleBtn.title = 'Switch right video version (' + rightSources[(current+1)%rightSources.length].label + ')';
    });
    //cycleBtn.title = 'Switch right video version (' + rightSources[1].label + ')';
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
  requestAnimationFrame(() => setSlider(0.5));
});
