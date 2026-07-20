/*
 * Page Data (Tracking) — data-only block that carries the tracking taxonomy WITH the
 * page. Authored once on the blueprint page; MSM live copies inherit the values via
 * rollout, so every bank page shares one tracking taxonomy.
 *
 * On decoration it reads the authored field values and initialises the Adobe Client
 * Data Layer (`window.adobeDataLayer`) with the page.pageInfo object.
 *
 * Rendering:
 *  - Published site: the block renders nothing (hidden via CSS).
 *  - Universal Editor: the block is revealed (body.ue-authoring) so authors can select
 *    it on the canvas and edit the tracking fields. It is NOT removed, otherwise its
 *    editor overlay would disappear.
 *
 * Fields (model order): trackingPageName, trackingSection, trackingLocale,
 * trackingCampaign, trackingTemplate.
 */

const FIELDS = [
  'trackingPageName',
  'trackingSection',
  'trackingLocale',
  'trackingCampaign',
  'trackingTemplate',
];

export default function decorate(block) {
  const rows = [...block.children].map((row) => row.firstElementChild);

  const pageInfo = {};
  FIELDS.forEach((name, index) => {
    pageInfo[name] = rows[index]?.textContent?.trim() || '';
  });

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({ page: { pageInfo } });

  // Universal Editor instruments the page with data-aue-* attributes. When present we
  // keep the block visible + selectable for authoring; otherwise CSS hides it.
  if (document.querySelector('[data-aue-resource]')) {
    document.body.classList.add('ue-authoring');
    block.classList.add('page-data--editor');
  }
}
