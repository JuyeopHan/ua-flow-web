const ugValues = [0, 10, 30, 50];
const ucfgValues = [0, 1, 2, 5, 10, 20];
const ug = document.querySelector('#ug-scale');
const ucfg = document.querySelector('#ucfg-scale');
const exampleCards = document.querySelectorAll('.sweep-example');

function updateExplorer() {
  const row = Number(ug.value);
  const col = Number(ucfg.value);
  for (const card of exampleCards) {
    const name = card.querySelector('h5').textContent;
    for (const frame of card.querySelectorAll('.sprite')) {
      frame.style.setProperty('--row', row);
      frame.style.setProperty('--col', col);
    }
    card.querySelector('[data-sample-image]').alt = `${name} generated with UG scale ${ugValues[row]} and maximum UCFG scale ${ucfgValues[col]}`;
    card.querySelector('[data-uncertainty-image]').alt = `Predicted latent uncertainty for ${name.toLowerCase()}, UG ${ugValues[row]}, maximum UCFG ${ucfgValues[col]}; brighter indicates higher uncertainty`;
  }
  document.querySelector('#ug-output').value = ugValues[row];
  document.querySelector('#ucfg-output').value = ucfgValues[col];
  ug.setAttribute('aria-valuetext', String(ugValues[row]));
  ucfg.setAttribute('aria-valuetext', String(ucfgValues[col]));
  document.querySelector('#explorer-status').textContent = `All five examples · UG ${ugValues[row]} · Maximum UCFG ${ucfgValues[col]}`;
}

ug.addEventListener('input', updateExplorer);
ucfg.addEventListener('input', updateExplorer);
document.querySelector('#reset-explorer').addEventListener('click', () => {
  ug.value = '2';
  ucfg.value = '2';
  updateExplorer();
});
updateExplorer();

let copyTimeout;
document.querySelector('#copy-citation').addEventListener('click', async () => {
  const code = document.querySelector('#bibtex');
  const status = document.querySelector('#copy-status');
  const label = document.querySelector('#copy-citation span');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(code.textContent);
    label.textContent = 'Copied!';
    status.textContent = 'Citation copied to clipboard.';
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => { label.textContent = 'Copy citation'; status.textContent = ''; }, 3000);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C (or ⌘C) to copy.';
  }
});
