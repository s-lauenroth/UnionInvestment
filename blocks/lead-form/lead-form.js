/*
 * Lead form (waitlist)
 * --------------------
 * Lightweight, no backend. Fields: Vorname, Nachname, E-Mail + Double-Opt-In checkbox.
 * On submit the form does NOT send anything — it only dispatches the custom event
 * `union:lead-submitted` on `document`, which the voucher block listens for to reveal
 * the gift card. (Brief: "Formular landet im Nichts.")
 *
 * NOTE: the DOI checkbox label is a placeholder until the final legal text is provided.
 */

const LEAD_SUBMIT_EVENT = 'union:lead-submitted';

const DEFAULTS = {
  heading: 'Jetzt anmelden',
  firstNameLabel: 'Vorname',
  lastNameLabel: 'Nachname',
  emailLabel: 'name@beispiel.de',
  doiLabel: 'Ich stimme der Kontaktaufnahme zu (Double-Opt-In)',
  submitLabel: 'Absenden',
};

function readField(rows, index, fallback = '') {
  const value = rows[index]?.textContent?.trim();
  return value || fallback;
}

export default async function decorate(block) {
  const rows = [...block.children].map((row) => row.firstElementChild);
  const config = {
    heading: readField(rows, 0, DEFAULTS.heading),
    firstNameLabel: readField(rows, 1, DEFAULTS.firstNameLabel),
    lastNameLabel: readField(rows, 2, DEFAULTS.lastNameLabel),
    emailLabel: readField(rows, 3, DEFAULTS.emailLabel),
    doiLabel: readField(rows, 4, DEFAULTS.doiLabel),
    submitLabel: readField(rows, 5, DEFAULTS.submitLabel),
  };

  block.innerHTML = '';

  if (config.heading) {
    const heading = document.createElement('h2');
    heading.className = 'lead-form-heading';
    heading.textContent = config.heading;
    block.append(heading);
  }

  const form = document.createElement('form');
  form.className = 'lead-form-form';
  form.setAttribute('novalidate', '');
  form.innerHTML = `
    <div class="lead-form-row-2col">
      <input type="text" name="firstName" autocomplete="given-name"
        placeholder="${config.firstNameLabel}" aria-label="${config.firstNameLabel}" required>
      <input type="text" name="lastName" autocomplete="family-name"
        placeholder="${config.lastNameLabel}" aria-label="${config.lastNameLabel}" required>
    </div>
    <input type="email" name="email" autocomplete="email"
      placeholder="${config.emailLabel}" aria-label="E-Mail" required>
    <label class="lead-form-checkbox">
      <input type="checkbox" name="doi" required>
      <span>${config.doiLabel}</span>
    </label>
    <button type="submit" class="lead-form-submit">${config.submitLabel}</button>`;

  block.append(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const detail = {
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      email: form.elements.email.value.trim(),
      doi: form.elements.doi.checked,
    };

    document.dispatchEvent(new CustomEvent(LEAD_SUBMIT_EVENT, { detail, bubbles: false }));

    form.classList.add('lead-form-form--submitted');
    const submitBtn = form.querySelector('.lead-form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Angemeldet ✓';
  });
}
