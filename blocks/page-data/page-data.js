/*
 * Page Data (Tracking) — hidden block that carries the tracking taxonomy WITH the
 * page. Authored once on the blueprint page; MSM live copies inherit the values via
 * rollout, so every bank page shares one tracking taxonomy.
 *
 * On decoration it reads the authored field values and initialises the Adobe Client
 * Data Layer (`window.adobeDataLayer`) with the page.pageInfo object, then removes
 * itself from the DOM so nothing is rendered.
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
  window.adobeDataLayer.push({
    page: {
      pageInfo,
    },
  });

  // Hidden block — remove it so it never renders on the page.
  block.remove();
}
