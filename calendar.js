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
let popupTimer;
let remainingMessages = [];
const lockedMessages = [
  'Oooh, too soon!',
  'Not yet',
  'No peeking',
  "Santa knows when you've been bad",
  'Caught ya!'
];

function showLockedMessage(day) {
  if (!remainingMessages.length) remainingMessages = [...lockedMessages];
  const index = Math.floor(Math.random() * remainingMessages.length);
  const [message] = remainingMessages.splice(index, 1);
  statusLine.textContent = message + ' • Opens December ' + day;
  statusLine.classList.add('locked-popup');
  clearTimeout(popupTimer);
  popupTimer = setTimeout(refresh, 3500);
}

function unlocked(day, now = new Date()) {
  return now >= new Date(year, 11, day);
}

function refresh() {
  clearTimeout(popupTimer);
  statusLine.classList.remove('locked-popup');
  let available = 0;
  for (const button of doors.children) {
    const day = Number(button.value);
    const open = unlocked(day);
    available += Number(open);
    button.classList.toggle('available', open);
    button.setAttribute('aria-label', open ? 'Open December ' + day + ' GIF' : 'Door ' + day + ', opens December ' + day);
    button.title = button.getAttribute('aria-label');
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
  button.addEventListener('click', () => {
    if (!unlocked(day)) {
      showLockedMessage(day);
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
