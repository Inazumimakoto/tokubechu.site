const track = document.querySelector('.video-track');
const slides = [...document.querySelectorAll('.video-slide')];
const tabs = [...document.querySelectorAll('.video-tab')];
const tabList = document.querySelector('.video-tabs');
const arrows = [...document.querySelectorAll('.video-arrow')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;
let scrollFrame;
let requestedSlide = null;

function stopVideo(slide) {
  slide.querySelector('iframe')?.remove();
  slide.querySelector('.video-poster').hidden = false;
}

function selectSlide(index) {
  activeSlide = index;
  slides.forEach((slide, slideIndex) => {
    if (slideIndex !== index) stopVideo(slide);
  });
  tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.category === slides[index].dataset.category)));
  const activeTab = tabs.find(tab => tab.dataset.category === slides[index].dataset.category);
  if (activeTab) tabList.scrollTo({ left: activeTab.offsetLeft - tabs[0].offsetLeft - (tabList.clientWidth - activeTab.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  arrows[0].disabled = index === 0;
  arrows[1].disabled = index === slides.length - 1;
}

function scrollToSlide(index, behavior = reducedMotion.matches ? 'instant' : 'smooth') {
  const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
  requestedSlide = nextIndex;
  selectSlide(nextIndex);
  track.scrollTo({
    left: slides[nextIndex].offsetLeft - slides[0].offsetLeft,
    behavior,
  });
}

tabs.forEach(tab => tab.addEventListener('click', () => {
  const index = slides.findIndex(slide => slide.dataset.category === tab.dataset.category);
  if (index !== -1) scrollToSlide(index);
}));
arrows.forEach(arrow => arrow.addEventListener('click', () => scrollToSlide(activeSlide + Number(arrow.dataset.direction))));

track.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    const firstOffset = slides[0].offsetLeft;
    if (requestedSlide !== null) {
      const destination = slides[requestedSlide].offsetLeft - firstOffset;
      if (Math.abs(track.scrollLeft - destination) > 2) return;
      requestedSlide = null;
    }
    let nearest = 0;
    slides.forEach((slide, index) => {
      if (Math.abs(slide.offsetLeft - firstOffset - track.scrollLeft) < Math.abs(slides[nearest].offsetLeft - firstOffset - track.scrollLeft)) nearest = index;
    });
    if (nearest !== activeSlide) selectSlide(nearest);
  });
}, { passive: true });

// A swipe or wheel gesture takes over from a button's smooth scroll.
['pointerdown', 'wheel'].forEach(eventName => {
  track.addEventListener(eventName, () => { requestedSlide = null; }, { passive: true });
});

track.addEventListener('keydown', event => {
  if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') scrollToSlide(0);
  else if (event.key === 'End') scrollToSlide(slides.length - 1);
  else scrollToSlide(activeSlide + (event.key === 'ArrowRight' ? 1 : -1));
});

slides.forEach((slide, index) => {
  const poster = slide.querySelector('.video-poster');
  poster.addEventListener('click', () => {
    scrollToSlide(index, 'instant');
    const iframe = document.createElement('iframe');
    const url = new URL(`https://www.youtube-nocookie.com/embed/${slide.dataset.videoId}`);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('playsinline', '1');
    url.searchParams.set('origin', window.location.origin);
    iframe.src = url.href;
    iframe.title = slide.querySelector('.video-caption h2').textContent;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    poster.hidden = true;
    slide.querySelector('.video-frame').append(iframe);
    iframe.focus();
  });
});
