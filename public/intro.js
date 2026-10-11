async function startIntro() {
  try {
    await Promise.all([...document.querySelectorAll('.phrase__image')].map(image => image.decode()));
  } catch {
    document.body.classList.add('has-asset-error');
  }
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

startIntro();
