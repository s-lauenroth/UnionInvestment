/*
 * Brand-Bar — in-page header strip: one replaceable logo (left) + navigation (right).
 * Carries the bank identity WITH the page, so an MSM live copy becomes a bank
 * variant by swapping the logo + nav here (the global site nav is hidden on
 * vr-theme pages). Fields (model order): logo (reference), logoAlt, nav (richtext).
 */

export default function decorate(block) {
  const picture = block.querySelector('picture, img');
  const navSource = [...block.children].find((row) => row.querySelector('a, ul'));

  const inner = document.createElement('div');
  inner.className = 'brand-bar-inner';

  if (picture) {
    const logo = document.createElement('span');
    logo.className = 'brand-bar-logo';
    logo.append(picture);
    inner.append(logo);
  }

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
