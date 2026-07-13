/*
 * Brand-Bar — slim in-page header strip (logo + bank name + optional claim).
 * Carries the bank identity WITH the page, so an MSM live copy becomes a bank
 * variant by swapping just the logo + name here (the global site nav is shared).
 * Fields (model order): logo (reference), logoAlt, bankName, claim.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const picture = rows[0]?.querySelector('picture, img');
  const logoAlt = (rows[1]?.textContent || '').trim();
  const bankName = (rows[2]?.textContent || '').trim();
  const claim = (rows[3]?.textContent || '').trim();

  const inner = document.createElement('div');
  inner.className = 'brand-bar-inner';

  if (picture) {
    const logo = document.createElement('span');
    logo.className = 'brand-bar-logo';
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    if (img && logoAlt) img.alt = logoAlt;
    logo.append(picture);
    inner.append(logo);
  }

  if (bankName || claim) {
    const text = document.createElement('span');
    text.className = 'brand-bar-text';
    if (bankName) {
      const name = document.createElement('span');
      name.className = 'brand-bar-name';
      name.textContent = bankName;
      text.append(name);
    }
    if (claim) {
      const c = document.createElement('span');
      c.className = 'brand-bar-claim';
      c.textContent = claim;
      text.append(c);
    }
    inner.append(text);
  }

  block.textContent = '';
  block.append(inner);
}
