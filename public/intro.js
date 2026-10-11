async function startIntro() {
  const finishIntro = () => document.body.classList.add('is-intro-complete');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lastPhrase = document.querySelector('.phrase--second .phrase__motion');
  lastPhrase.addEventListener('animationend', event => {
    if (event.animationName === 'second-pass') finishIntro();
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) finishIntro();
  });
  try {
    await Promise.all([...document.querySelectorAll('.phrase__image')].map(image => image.decode()));
  } catch {
    finishIntro();
  }
  requestAnimationFrame(() => {
    document.body.classList.add('is-ready');
    if (reducedMotion.matches) finishIntro();
  });
}

startIntro();
