function setupIntro() {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const images = [...document.querySelectorAll('.phrase__image')];
  const phrases = [...document.querySelectorAll('.phrase__motion')];
  let run = 0;
  let frame = 0;
  let previousFrame = null;
  let frozen = false;

  const syncVisibility = () => {
    previousFrame = null;
    body.classList.toggle('is-intro-paused', document.hidden || frozen);
  };
  const stopClock = () => {
    cancelAnimationFrame(frame);
    previousFrame = null;
  };
  const finishIntro = () => {
    stopClock();
    body.classList.add('is-intro-complete');
  };

  document.addEventListener('visibilitychange', syncVisibility);
  document.addEventListener('freeze', () => {
    frozen = true;
    syncVisibility();
  });
  document.addEventListener('resume', () => {
    frozen = false;
    syncVisibility();
  });
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
    stopClock();
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

    // CSS supplies the artwork's motion, but rendered frames supply its clock.
    // A new tab or a suspended renderer must not consume the first phrase unseen.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (currentRun !== run || body.classList.contains('is-intro-complete')) return;
        body.classList.add('is-ready');
        const animations = phrases.flatMap(phrase => phrase.getAnimations());
        if (!animations.length) {
          finishIntro();
          return;
        }
        const endTime = Math.max(...animations.map(animation => animation.effect.getComputedTiming().endTime));
        let elapsed = 0;
        animations.forEach(animation => {
          animation.pause();
          animation.currentTime = 0;
        });

        const advance = timestamp => {
          if (currentRun !== run || body.classList.contains('is-intro-complete')) return;
          if (document.hidden || frozen) {
            previousFrame = null;
          } else {
            if (previousFrame !== null) {
              // Keep the normal tempo; discard time when the browser couldn't draw.
              elapsed += Math.min(Math.max(timestamp - previousFrame, 0), 100);
            }
            previousFrame = timestamp;
            animations.forEach(animation => { animation.currentTime = elapsed; });
            if (elapsed >= endTime) {
              finishIntro();
              return;
            }
          }
          frame = requestAnimationFrame(advance);
        };
        frame = requestAnimationFrame(advance);
      });
    });
  }

  window.addEventListener('pageshow', event => {
    if (event.persisted) startIntro();
  });
  startIntro();
}

setupIntro();
