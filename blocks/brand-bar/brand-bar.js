/*
 * Brand-Bar — in-page header strip: logo + bank name (left) + navigation (right).
 * Carries the bank identity WITH the page, so an MSM live copy becomes a bank
 * variant by swapping the logo/name/nav here (the global site nav is hidden on
 * vr-theme pages). Fields (model order): logo (reference), logoAlt, bankName,
 * claim, nav (richtext list of links).
 */

export default function decorate(block) {
  const rows = [...block.children];
  const picture = block.querySelector('picture, img');
  // The nav row is the one carrying links; the logo's alt is paired with the
  // reference field, so the remaining plain-text rows are bankName + claim.
  const navSource = rows.find((row) => row.querySelector('a, ul'));
  const textRows = rows.filter(
    (row) => row !== navSource && !row.querySelector('picture, img'),
  );
  const bankName = (textRows[0]?.textContent || '').trim();
  const claim = (textRows[1]?.textContent || '').trim();

  const inner = document.createElement('div');
  inner.className = 'brand-bar-inner';

  const brand = document.createElement('div');
  brand.className = 'brand-bar-brand';
  if (picture) {
    const logo = document.createElement('span');
    logo.className = 'brand-bar-logo';
    logo.append(picture);
    brand.append(logo);
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
    brand.append(text);
  }
  inner.append(brand);

  if (navSource) {
    const nav = document.createElement('nav');
    nav.className = 'brand-bar-nav';
    const list = navSource.querySelector('ul');
    if (list) {
      nav.append(list);
    } else {
      navSource.querySelectorAll('a').forEach((a) => nav.append(a));
    }
    inner.append(nav);
  }

  block.textContent = '';
  block.append(inner);
}
