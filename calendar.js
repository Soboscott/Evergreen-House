const year = 2026;
const doors = document.querySelector('#doors');
const statusLine = document.querySelector('#status');
const dialog = document.querySelector('dialog');
const scene = dialog.querySelector('#scene');
const sourceLink = dialog.querySelector('#giphy-link');
const gifByDoor = {
  1: 'WmkqburJqXziM',
  2: 'PcKgXgisPwieA',
  3: 'd1DXrwT2CFD4iNxK',
  4: 'D28t0Rto3daKI',
  5: 'UTFiHeDL8cOSA',
  6: '3o6wrrn32NwP5EgpTG',
  7: 'l0Erxgfp6Ws0oZYqI',
  8: '12FzFh6fiJzvq0',
  9: '8UF5nCsvYHe5a',
  10: 'LREcDcFGuoU',
  11: 'xUPOqtMLKm2Nwt2wXS',
  12: '9w475hDWEPVlu',
  13: 'l0HlF0Uc19pEzigGQ',
  14: '3bzBKgwX5A6bMh0vl9',
  15: 'DjmY61OlzO1sQ',
  16: 'yAhVmsVDyPMGI',
  17: '3o6wruT67340unOXRu',
  18: '3nXEgJKLx3ZKQNtgxQ',
  19: 'lKbvzAgRYvXos',
  20: 'eMDwDlzP7YhqFygsBb',
  21: 'UzB5YpHcrSWHgzw2FA',
  22: '26FKTVIRyPufjuGsM',
  23: '7v23nKQW50xyM',
  24: '1X4B2AfWj43aGE0U6A',
  25: 'zTQyKkuzZXOrJZVEQ0'
};
const error = document.querySelector('#error');
let activeDoor;
const tooltip = document.querySelector('#door-tip');
let tipDoor;
let remainingMessages = [];
const lockedMessages = [
  'Oooh, too soon!',
  'Not yet',
  'No peeking',
  "Santa knows when you've been bad",
  'Caught ya!'
];

function hideTip() {
  tipDoor?.removeAttribute('aria-describedby');
  tipDoor = null;
  tooltip.hidden = true;
}

function positionTip() {
  if (!tipDoor) return;
  const door = tipDoor.getBoundingClientRect();
  const center = door.left + door.width / 2;
  const left = Math.max(8, Math.min(center - tooltip.offsetWidth / 2, document.documentElement.clientWidth - tooltip.offsetWidth - 8));
  const below = door.top < tooltip.offsetHeight + 14;
  tooltip.classList.toggle('below', below);
  tooltip.style.left = left + 'px';
  tooltip.style.top = (below ? door.bottom + 7 : door.top - tooltip.offsetHeight - 7) + 'px';
  tooltip.style.setProperty('--arrow', (center - left) + 'px');
}

function showLockedMessage(button) {
  if (unlocked(Number(button.value)) || tipDoor === button) return;
  hideTip();
  tipDoor = button;
  if (!remainingMessages.length) remainingMessages = [...lockedMessages];
  const index = Math.floor(Math.random() * remainingMessages.length);
  const [message] = remainingMessages.splice(index, 1);
  tooltip.textContent = message + ' • Opens December ' + button.value;
  tooltip.hidden = false;
  button.setAttribute('aria-describedby', tooltip.id);
  positionTip();
}

function unlocked(day, now = new Date()) {
  return now >= new Date(year, 11, day);
}

function refresh() {
  hideTip();
  let available = 0;
  for (const button of doors.children) {
    const day = Number(button.value);
    const open = unlocked(day);
    available += Number(open);
    button.classList.toggle('available', open);
    button.setAttribute('aria-label', open ? 'Open December ' + day + ' GIF' : 'Door ' + day + ', opens December ' + day);

  }
  statusLine.textContent = available ? available + ' of 25 doors unlocked. Choose a gold-lit door.' : 'The first door opens December 1.';
}

for (let day = 1; day <= 25; day++) {
  const button = document.createElement('button');
  button.className = 'door';
  button.value = day;
  const leaf = document.createElement('span');
  leaf.className = 'leaf';
  leaf.textContent = day;
  button.append(leaf);
  doors.append(button);
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') showLockedMessage(button);
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && tipDoor === button && !button.matches(':focus-visible')) hideTip();
  });
  button.addEventListener('focus', () => showLockedMessage(button));
  button.addEventListener('blur', () => { if (tipDoor === button) hideTip(); });
  button.addEventListener('click', () => {
    if (!unlocked(day)) {
      showLockedMessage(button);
      return;
    }
    refresh();
    activeDoor = button;
    activeDoor.classList.add('playing');
    document.querySelector('#date').textContent = 'December ' + day;
    error.textContent = '';
    const gifId = gifByDoor[day];
    scene.alt = 'Christmas GIF for December ' + day;
    sourceLink.href = 'https://giphy.com/gifs/' + gifId;
    scene.src = 'https://media.giphy.com/media/' + gifId + '/giphy.gif';
    dialog.showModal();
  });
}
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTip(); });
document.addEventListener('pointerdown', event => { if (!tipDoor?.contains(event.target)) hideTip(); });
window.addEventListener('scroll', positionTip, { passive: true });
window.addEventListener('resize', positionTip);
scene.addEventListener('error', () => {
  if (dialog.open) error.textContent = 'This scene could not load. Use the GIPHY link below to view it.';
});
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  scene.removeAttribute('src');
  activeDoor.classList.remove('playing');
  activeDoor.focus();
});
refresh();
function scheduleRefresh() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  setTimeout(() => { refresh(); scheduleRefresh(); }, next - now + 50);
}
scheduleRefresh();
window.addEventListener('focus', refresh);
