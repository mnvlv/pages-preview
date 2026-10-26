/* Диаском — блок «3D-модель стеллажа»: ленивая загрузка model-viewer и кнопки управления */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-rack3d]').forEach((root) => {
    const stage = root.querySelector('.rack3d__stage');
    const viewer = root.querySelector('model-viewer');
    const lib = root.dataset.rack3dLib;

    // В узком (вертикальном) окне камера стоит дальше, чтобы стеллаж помещался целиком
    if (stage.clientWidth < stage.clientHeight * 1.2) viewer.setAttribute('camera-orbit', '35deg 72deg auto');

    // Библиотека (~1 МБ) и модель грузятся, только когда блок подходит к экрану
    const load = () => {
      if (!customElements.get('model-viewer')) {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = lib;
        document.head.append(s);
      }
      viewer.setAttribute('src', viewer.dataset.src);
    };
    const near = () => stage.getBoundingClientRect().top < window.innerHeight + 400;
    if (near() || !('IntersectionObserver' in window)) load();
    else {
      new IntersectionObserver((entries, io) => {
        if (entries[0].isIntersecting) { io.disconnect(); load(); }
      }, { rootMargin: '400px' }).observe(stage);
    }

    viewer.addEventListener('load', () => {
      root.classList.add('is-loaded');
      viewer.dataset.orbit = viewer.getAttribute('camera-orbit');
    });

    // Управление: приближение, сброс вида, авто-вращение, полный экран
    const zoom = (k) => {
      const o = viewer.getCameraOrbit();
      viewer.cameraOrbit = `${o.theta}rad ${o.phi}rad ${o.radius * k}m`;
    };
    root.querySelectorAll('[data-rack3d-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        switch (btn.dataset.rack3dAction) {
          case 'zoom-in': zoom(0.8); break;
          case 'zoom-out': zoom(1.25); break;
          case 'reset':
            viewer.cameraOrbit = viewer.dataset.orbit;
            viewer.cameraTarget = 'auto auto auto';
            viewer.fieldOfView = 'auto';
            break;
          case 'rotate': {
            const on = !viewer.hasAttribute('auto-rotate');
            viewer.toggleAttribute('auto-rotate', on);
            btn.setAttribute('aria-pressed', String(on));
            break;
          }
          case 'fullscreen':
            if (document.fullscreenElement) document.exitFullscreen();
            else stage.requestFullscreen?.();
            break;
          default:
        }
      });
    });
  });
});
