function setupIntro() {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const images = [...document.querySelectorAll('.phrase__image')];
  const lastPhrase = document.querySelector('.phrase--second .phrase__motion');
  let run = 0;

  const syncVisibility = () => body.classList.toggle('is-intro-paused', document.hidden);
  const finishIntro = () => body.classList.add('is-intro-complete');

  lastPhrase.addEventListener('animationend', event => {
    if (event.animationName === 'second-pass') finishIntro();
  });
  document.addEventListener('visibilitychange', syncVisibility);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) finishIntro();
  });

  async function readyImage(image) {
    if (!image.complete) {
      await new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }
    if (!image.naturalWidth) return false;
    try {
      await image.decode();
    } catch {
      // A decode rejection does not always mean the loaded image is unusable.
    }
    return image.naturalWidth > 0;
  }

  async function startIntro() {
    const currentRun = ++run;
    body.classList.remove('is-ready', 'is-intro-complete');
    syncVisibility();
    if (reducedMotion.matches) {
      finishIntro();
      return;
    }

    const loaded = await Promise.all(images.map(readyImage));
    if (currentRun !== run) return;
    if (loaded.some(ready => !ready) || reducedMotion.matches) {
      finishIntro();
      return;
    }

    // Let the decoded lettering and initial layout paint before starting the clock.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (currentRun === run && !body.classList.contains('is-intro-complete')) {
        body.classList.add('is-ready');
      }
    }));
  }

  window.addEventListener('pageshow', event => {
    if (event.persisted) startIntro();
  });
  startIntro();
}

setupIntro();
