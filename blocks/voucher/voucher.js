import { isAuthorEnvironment } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';

/*
 * Voucher module
 * --------------
 * Two states:
 *   - before lead submit: only an explanatory hint text is shown (no grey button).
 *   - after lead submit:  a two-column layout — gift-card visual (left) + details table (right).
 *
 * Visibility is toggled by the custom event `union:lead-submitted` dispatched by the
 * lead-form block. Voucher data (amount, code, validUntil, redeemable) is authorable as
 * a fallback and can be overridden from a "Voucher" Content Fragment via a GraphQL
 * Persisted Query (created later in the AEM-MCP phase).
 *
 * The gift-card visual is a stylised nod to the real dm gift card — the protected dm logo
 * is intentionally NOT reproduced pixel-for-pixel.
 */

const LEAD_SUBMIT_EVENT = 'union:lead-submitted';
const PERSISTED_QUERY = '/graphql/execute.json/unioninvestment/VoucherByPath';
// Reused from blocks/content-fragment: publish-side CORS wrapper (demo runs on author/UE).
const WRAPPER_SERVICE_URL = 'https://3635370-refdemoapigateway-stage.adobeioruntime.net/api/v1/web/ref-demo-api-gateway/fetch-cf';

const DEFAULTS = {
  hintText: 'Nach erfolgreicher Anmeldung erhalten Sie hier automatisch Ihren persönlichen Gutschein als Dankeschön.',
  voucherType: 'DM-Gutschein',
  amount: '20',
  exampleCode: 'DM-2026-25069',
  validUntil: '31.12.2026',
  redeemable: 'Filiale & online',
};

function readField(rows, index, fallback = '') {
  const value = rows[index]?.textContent?.trim();
  return value || fallback;
}

/** Optionally override voucher data from the Voucher Content Fragment. Fails silently. */
async function fetchVoucher(cfPath) {
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
    const item = json?.data?.voucherByPath?.item;
    if (!item) return null;
    return {
      voucherType: item.voucherType || DEFAULTS.voucherType,
      amount: item.amount != null ? String(item.amount) : DEFAULTS.amount,
      exampleCode: item.exampleCode || DEFAULTS.exampleCode,
      validUntil: item.validUntil || DEFAULTS.validUntil,
      redeemable: item.redeemable || DEFAULTS.redeemable,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Voucher: CF data unavailable, using static defaults.', error);
    return null;
  }
}

function buildRevealedContent(data) {
  const grid = document.createElement('div');
  grid.className = 'voucher-grid';
  grid.innerHTML = `
    <div class="voucher-card" role="img" aria-label="${data.voucherType} Kartenvisual">
      <div class="voucher-card-amount">${data.amount} €</div>
      <div class="voucher-card-script"><span>Geschenkkarte</span></div>
      <div class="voucher-card-brand">
        <div class="voucher-card-brand-name">dm</div>
        <div class="voucher-card-brand-tag">Hier bin ich Mensch</div>
      </div>
    </div>
    <div class="voucher-details">
      <h3>Ihr ${data.voucherType}</h3>
      <p class="voucher-details-sub">Dankeschön für Ihre Anmeldung</p>
      <table>
        <tbody>
          <tr><td class="voucher-details-label">Betrag</td><td class="voucher-details-value">${data.amount},00 €</td></tr>
          <tr><td class="voucher-details-label">Code</td><td class="voucher-details-value">${data.exampleCode}</td></tr>
          <tr><td class="voucher-details-label">Gültig bis</td><td class="voucher-details-value voucher-details-plain">${data.validUntil}</td></tr>
          <tr><td class="voucher-details-label">Einlösbar</td><td class="voucher-details-value voucher-details-plain">${data.redeemable}</td></tr>
        </tbody>
      </table>
    </div>`;
  return grid;
}

export default async function decorate(block) {
  const rows = [...block.children].map((row) => row.firstElementChild);
  const cfLink = block.querySelector('a[href]');
  const cfPath = cfLink?.getAttribute('href')?.trim() || '';

  const data = {
    hintText: readField(rows, 0, DEFAULTS.hintText),
    voucherType: readField(rows, 1, DEFAULTS.voucherType),
    amount: readField(rows, 2, DEFAULTS.amount),
    exampleCode: readField(rows, 3, DEFAULTS.exampleCode),
    validUntil: readField(rows, 4, DEFAULTS.validUntil),
    redeemable: readField(rows, 5, DEFAULTS.redeemable),
  };

  block.innerHTML = '';
  block.classList.add('voucher--pending');

  // Pre-submit state: hint text only.
  const hint = document.createElement('div');
  hint.className = 'voucher-hint';
  hint.innerHTML = `<p>${data.hintText}</p>`;
  block.append(hint);

  // Refresh voucher data from the CF (non-blocking for the reveal).
  const cfData = await fetchVoucher(cfPath);
  if (cfData) Object.assign(data, cfData);

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    block.classList.remove('voucher--pending');
    block.classList.add('voucher--revealed');
    hint.remove();
    block.append(buildRevealedContent(data));
  };

  document.addEventListener(LEAD_SUBMIT_EVENT, reveal);
}
