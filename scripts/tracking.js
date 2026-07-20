/*
 * Adobe Data Layer bootstrap.
 * Reads the tracking page-metadata (authored on the blueprint page properties
 * "Tracking" tab and rendered into <meta> tags in the head) and pushes it as the
 * page object into window.adobeDataLayer. MSM live copies inherit the values from
 * the blueprint via rollout, so all bank pages share one tracking taxonomy.
 */

function metaContent(...names) {
  for (let i = 0; i < names.length; i += 1) {
    const el = document.querySelector(`meta[name="${names[i]}"]`);
    if (el && el.content) return el.content.trim();
  }
  return '';
}

window.adobeDataLayer = window.adobeDataLayer || [];

window.adobeDataLayer.push({
  page: {
    pageInfo: {
      trackingPageName: metaContent('trackingPageName', 'tracking-page-name', 'trackingpagename'),
      trackingSection: metaContent('trackingSection', 'tracking-section', 'trackingsection'),
      trackingLocale: metaContent('trackingLocale', 'tracking-locale', 'trackinglocale'),
      trackingCampaign: metaContent('trackingCampaign', 'tracking-campaign', 'trackingcampaign'),
      trackingTemplate: metaContent('trackingTemplate', 'tracking-template', 'trackingtemplate'),
    },
  },
});
