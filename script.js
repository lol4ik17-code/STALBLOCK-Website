'use strict';
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
if (menuButton && mobileMenu) {
  const closeMenu = () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  };
  menuButton.addEventListener('click', () => {
    const isOpening = mobileMenu.hidden;
    mobileMenu.hidden = !isOpening;
    menuButton.setAttribute('aria-expanded', String(isOpening));
    menuButton.setAttribute('aria-label', isOpening ? 'Закрыть меню' : 'Открыть меню');
  });
  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
}
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());


// STALBLOCK PDA: local-only, non-networked website prototype.
const pdaTabButtons = Array.from(document.querySelectorAll('[data-pda-tab]'));
const pdaPages = Array.from(document.querySelectorAll('.pda-page'));
function activatePDATab(tab, focus = false) {
  if (!tab) return;
  pdaTabButtons.forEach(button => {
    const active = button === tab;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  pdaPages.forEach(page => {
    const active = page.id === `pda-${tab.dataset.pdaTab}`;
    page.hidden = !active;
    page.classList.toggle('is-active', active);
  });
}
pdaTabButtons.forEach((button, index) => {
  button.addEventListener('click', () => activatePDATab(button));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? pdaTabButtons.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + pdaTabButtons.length) % pdaTabButtons.length;
    activatePDATab(pdaTabButtons[next], true);
  });
});
const fakeMapEntries = {
  base: { name: 'УБЕЖИЩЕ', text: 'Безопасный пункт. Здесь можно восстановить снаряжение и подготовиться к вылазке.', coords: 'СЕКТОР 07 — A3' },
  anomaly: { name: 'АНОМАЛЬНАЯ ЗОНА', text: 'Нестабильный участок. Показания датчика меняются. На карте отмечен только предполагаемый радиус.', coords: 'СЕКТОР 07 — C2' },
  signal: { name: 'НЕИЗВЕСТНЫЙ СИГНАЛ', text: 'Зафиксирована слабая передача с северного направления. Источник пока не определён.', coords: 'СЕКТОР 07 — B1' }
};
const mapMarkers = Array.from(document.querySelectorAll('[data-marker]'));
mapMarkers.forEach(marker => marker.addEventListener('click', () => {
  const item = fakeMapEntries[marker.dataset.marker];
  if (!item) return;
  mapMarkers.forEach(m => m.classList.toggle('is-active', m === marker));
  document.getElementById('pda-place-name').textContent = item.name;
  document.getElementById('pda-place-info').textContent = item.text;
  document.getElementById('pda-place-coords').textContent = item.coords;
}));
function updatePDADemoClock() {
  const el = document.getElementById('pda-clock');
  if (el) el.textContent = new Date().toLocaleTimeString('ru-RU', {hour12:false});
}
updatePDADemoClock();
setInterval(updatePDADemoClock, 1000);
