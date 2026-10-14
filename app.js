const ugValues = [0, 10, 30, 50];
const ucfgValues = [0, 1, 2, 5, 10, 20];
const exampleNames = { 'guinea-pig': 'Guinea pig', goldfinch: 'Goldfinch', 'rocking-chair': 'Rocking chair', church: 'Church' };
const ug = document.querySelector('#ug-scale');
const ucfg = document.querySelector('#ucfg-scale');
const exampleButtons = document.querySelectorAll('[data-example]');
let example = 'guinea-pig';

function updateExplorer() {
  const row = Number(ug.value);
  const col = Number(ucfg.value);
  const name = exampleNames[example];
  for (const id of ['sample-frame', 'uncertainty-frame']) {
    const frame = document.getElementById(id);
    frame.style.setProperty('--row', row);
    frame.style.setProperty('--col', col);
  }
  document.querySelector('#sample-image').src = `assets/${example}.webp`;
  document.querySelector('#sample-image').alt = `${name} generated with UG scale ${ugValues[row]} and maximum UCFG scale ${ucfgValues[col]}`;
  document.querySelector('#uncertainty-image').src = `assets/${example}-uncertainty.webp`;
  document.querySelector('#uncertainty-image').alt = `Predicted latent uncertainty for ${name.toLowerCase()}, UG ${ugValues[row]}, maximum UCFG ${ucfgValues[col]}; brighter indicates higher uncertainty`;
  document.querySelector('#ug-output').value = ugValues[row];
  document.querySelector('#ucfg-output').value = ucfgValues[col];
  ug.setAttribute('aria-valuetext', String(ugValues[row]));
  ucfg.setAttribute('aria-valuetext', String(ucfgValues[col]));
  document.querySelector('#explorer-status').textContent = `${name} · UG ${ugValues[row]} · Maximum UCFG ${ucfgValues[col]}`;
  for (const button of exampleButtons) {
    const selected = button.dataset.example === example;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
}

ug.addEventListener('input', updateExplorer);
ucfg.addEventListener('input', updateExplorer);
for (const button of exampleButtons) {
  button.addEventListener('click', () => {
    example = button.dataset.example;
    updateExplorer();
  });
}
document.querySelector('#reset-explorer').addEventListener('click', () => {
  example = 'guinea-pig';
  ug.value = '2';
  ucfg.value = '2';
  updateExplorer();
});

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
