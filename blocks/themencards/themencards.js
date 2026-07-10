/*
 * Themen-Kacheln — solid UI-Blau cards with white line-icons and UI-Grün accents,
 * modelled on the "Investmentfonds für alle Lebenslagen" tiles on union-investment.de.
 * Container block ("Themencards") with "Themencard" item children; each item row holds
 * the fields in model order: icon, title, text, linkText, link.
 */

const ICONS = {
  chart: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="40" x2="41" y2="40"/>
    <rect x="11" y="26" width="6" height="13"/><rect x="21" y="21" width="6" height="18"/><rect x="31" y="15" width="6" height="24"/>
    <polyline class="tc-accent" points="13,22 22,14 30,18 41,7"/><polyline class="tc-accent" points="35,7 41,7 41,13"/></svg>`,
  vorsorge: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 5l16 6v10c0 10-7 17-16 21-9-4-16-11-16-21V11z"/>
    <polyline class="tc-accent" points="16,24 22,30 32,17"/></svg>`,
  sparen: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 26c0-8-8-13-17-13S8 18 8 25c0 4 2 7 5 9v5h5l2-3c1 .2 2 .3 3 .3s2-.1 3-.3l2 3h5v-5c1-1 2-2 3-4h3v-4z"/>
    <line x1="18" y1="12" x2="27" y2="12"/><circle cx="12" cy="24" r="1.5" fill="currentColor" stroke="none"/>
    <text class="tc-accent-fill" x="26" y="26" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700">€</text></svg>`,
  anlegen: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 30c5-1 9-1 13 1l6 2h8c2 0 2 3 0 3l-9 1"/><path d="M6 28v9"/>
    <circle class="tc-accent" cx="30" cy="14" r="8"/>
    <text class="tc-accent-fill" x="30" y="14" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700">€</text></svg>`,
  nachhaltigkeit: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path class="tc-accent" d="M40 8c-16 0-28 8-28 22 0 4 1 7 3 10"/>
    <path d="M12 40C12 22 26 12 40 8c0 18-10 30-24 30-1.5 0-3-.2-4-.5z"/></svg>`,
  generic: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="24" cy="24" r="18"/><line class="tc-accent" x1="24" y1="16" x2="24" y2="16"/><line x1="24" y1="22" x2="24" y2="32"/></svg>`,
};

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'themencards-grid';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const iconKey = (cells[0]?.textContent || '').trim().toLowerCase();
    const title = (cells[1]?.textContent || '').trim();
    const text = (cells[2]?.textContent || '').trim();
    const linkText = (cells[3]?.textContent || '').trim();
    const href = cells[4]?.querySelector('a')?.getAttribute('href')
      || (cells[4]?.textContent || '').trim();

    const card = document.createElement('div');
    card.className = 'themencard';
    card.innerHTML = `
      <div class="themencard-icon">${ICONS[iconKey] || ICONS.generic}</div>
      ${title ? `<h3 class="themencard-title">${title}</h3>` : ''}
      ${text ? `<p class="themencard-text">${text}</p>` : ''}
      ${linkText ? `<a class="themencard-link" href="${href || '#'}">${linkText}</a>` : ''}`;
    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
