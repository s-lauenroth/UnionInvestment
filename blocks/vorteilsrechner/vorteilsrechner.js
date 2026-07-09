import { isAuthorEnvironment } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';

/*
 * Vorteilsrechner (benefit calculator)
 * -----------------------------------
 * Two range sliders (Anlagebetrag, Laufzeit) with a live-updating result.
 * The calculation is intentionally a free/static formula — no real finance logic.
 *
 * Base parameters (baseRate, bonusRate, teaserText) are authorable on the block as
 * fallbacks, and can be overridden at runtime from a "VorteilsrechnerParameter"
 * Content Fragment via a GraphQL Persisted Query. The CF/GraphQL layer is created
 * later (AEM-MCP phase); until then the authored/static defaults are used.
 */

const PERSISTED_QUERY = '/graphql/execute.json/unioninvestment/VorteilsrechnerParameterByPath';
// Reused from blocks/content-fragment: publish-side CORS wrapper (demo runs on author/UE).
const WRAPPER_SERVICE_URL = 'https://3635370-refdemoapigateway-stage.adobeioruntime.net/api/v1/web/ref-demo-api-gateway/fetch-cf';

const AMOUNT = {
  min: 1000, max: 50000, step: 500, default: 10000,
};
const DURATION = {
  min: 1, max: 15, step: 1, default: 5,
};

const euroFmt = new Intl.NumberFormat('de-DE', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
});

const DEFAULTS = {
  heading: 'Vorteilsrechner',
  amountLabel: 'Anlagebetrag',
  durationLabel: 'Laufzeit',
  resultLabel: 'Ihr möglicher Vorteil',
  baseRate: 1.5,
  bonusRate: 0.5,
  teaserText: '',
};

/** Read the ordered field rows a crosswalk block renders (value-only inner divs). */
function readField(rows, index, fallback = '') {
  const value = rows[index]?.textContent?.trim();
  return value || fallback;
}

function toNumber(value, fallback) {
  const parsed = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Free/static benefit formula — purely illustrative. */
function calculateBenefit(amount, years, baseRate, bonusRate) {
  const annualRate = (baseRate + bonusRate) / 100;
  return Math.round(amount * annualRate * years);
}

/**
 * Attempt to override base parameters from the VorteilsrechnerParameter Content Fragment.
 * Fails silently (returns null) so the block always works with authored/static defaults.
 */
async function fetchParams(cfPath) {
  if (!cfPath) return null;
  try {
    const isAuthor = isAuthorEnvironment();
    const authorUrl = getMetadata('authorurl') || '';
    const publishUrl = authorUrl.replace('author', 'publish').replace(/\/$/, '');
    const request = isAuthor
      ? {
        url: `${authorUrl}${PERSISTED_QUERY};path=${cfPath};ts=${Date.now()}`,
        options: { method: 'GET', headers: { 'Content-Type': 'application/json' } },
      }
      : {
        url: WRAPPER_SERVICE_URL,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ graphQLPath: `${publishUrl}${PERSISTED_QUERY}`, cfPath }),
        },
      };
    const response = await fetch(request.url, request.options);
    if (!response.ok) return null;
    const json = await response.json();
    const item = json?.data?.vorteilsrechnerParameterByPath?.item;
    if (!item) return null;
    return {
      baseRate: toNumber(item.baseRate, DEFAULTS.baseRate),
      bonusRate: toNumber(item.bonusRate, DEFAULTS.bonusRate),
      teaserText: item.teaserText || '',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Vorteilsrechner: CF params unavailable, using static defaults.', error);
    return null;
  }
}

function buildSliderRow(id, labelText, config, valueText) {
  const row = document.createElement('div');
  row.className = 'vorteilsrechner-slider-row';
  row.innerHTML = `
    <label for="vr-${id}">${labelText}</label>
    <input type="range" id="vr-${id}" min="${config.min}" max="${config.max}"
      step="${config.step}" value="${config.default}">
    <span class="vorteilsrechner-value" data-for="${id}">${valueText}</span>`;
  return row;
}

export default async function decorate(block) {
  const rows = [...block.children].map((row) => row.firstElementChild);
  const cfLink = block.querySelector('a[href]');
  const cfPath = cfLink?.getAttribute('href')?.trim() || '';

  const params = {
    heading: readField(rows, 0, DEFAULTS.heading),
    amountLabel: readField(rows, 1, DEFAULTS.amountLabel),
    durationLabel: readField(rows, 2, DEFAULTS.durationLabel),
    resultLabel: readField(rows, 3, DEFAULTS.resultLabel),
    baseRate: toNumber(readField(rows, 4, DEFAULTS.baseRate), DEFAULTS.baseRate),
    bonusRate: toNumber(readField(rows, 5, DEFAULTS.bonusRate), DEFAULTS.bonusRate),
    teaserText: readField(rows, 6, DEFAULTS.teaserText),
  };

  block.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'vorteilsrechner-card';

  if (params.heading) {
    const heading = document.createElement('h2');
    heading.className = 'vorteilsrechner-heading';
    heading.textContent = params.heading;
    block.append(heading);
  }

  const amountRow = buildSliderRow('amount', params.amountLabel, AMOUNT, euroFmt.format(AMOUNT.default));
  const durationRow = buildSliderRow('duration', params.durationLabel, DURATION, `${DURATION.default} Jahre`);

  const resultRow = document.createElement('div');
  resultRow.className = 'vorteilsrechner-result-row';
  resultRow.innerHTML = `
    <span class="vorteilsrechner-result-label">${params.resultLabel}</span>
    <span class="vorteilsrechner-result-value">+ 0 €</span>`;

  card.append(amountRow, durationRow, resultRow);

  if (params.teaserText) {
    const teaser = document.createElement('p');
    teaser.className = 'vorteilsrechner-teaser';
    teaser.textContent = params.teaserText;
    card.append(teaser);
  }

  block.append(card);

  const amountInput = amountRow.querySelector('input');
  const durationInput = durationRow.querySelector('input');
  const amountValue = amountRow.querySelector('.vorteilsrechner-value');
  const durationValue = durationRow.querySelector('.vorteilsrechner-value');
  const resultValue = resultRow.querySelector('.vorteilsrechner-result-value');

  const update = () => {
    const amount = Number(amountInput.value);
    const years = Number(durationInput.value);
    amountValue.textContent = euroFmt.format(amount);
    durationValue.textContent = `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`;
    const benefit = calculateBenefit(amount, years, params.baseRate, params.bonusRate);
    resultValue.textContent = `+ ${euroFmt.format(benefit)}`;
  };

  amountInput.addEventListener('input', update);
  durationInput.addEventListener('input', update);
  update();

  // Optionally refine base parameters from the Content Fragment, then recompute.
  const cfParams = await fetchParams(cfPath);
  if (cfParams) {
    params.baseRate = cfParams.baseRate;
    params.bonusRate = cfParams.bonusRate;
    if (cfParams.teaserText && !params.teaserText) {
      const teaser = document.createElement('p');
      teaser.className = 'vorteilsrechner-teaser';
      teaser.textContent = cfParams.teaserText;
      card.append(teaser);
    }
    update();
  }
}
