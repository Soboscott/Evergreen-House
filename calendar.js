const year = 2026;
const doors = document.querySelector('#doors');
const statusLine = document.querySelector('#status');
const dialog = document.querySelector('dialog');
const video = dialog.querySelector('video');
const error = document.querySelector('#error');
let activeDoor;

function unlocked(day, now = new Date()) {
  return now >= new Date(year, 11, day);
}

function refresh() {
  let available = 0;
  for (const button of doors.children) {
    const day = Number(button.value);
    const open = unlocked(day);
    available += Number(open);
    button.classList.toggle('available', open);
    button.setAttribute('aria-label', open ? 'Play December ' + day + ' video' : 'Door ' + day + ', opens December ' + day);
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
      statusLine.textContent = 'Door ' + day + ' opens December ' + day + ', ' + year + '.';
      return;
    }
    activeDoor = button;
    activeDoor.classList.add('playing');
    document.querySelector('#date').textContent = 'December ' + day;
    error.textContent = '';
    video.src = 'videos/' + String(day).padStart(2, '0') + '.mp4';
    dialog.showModal();
    video.play().catch(() => {});
  });
}
video.addEventListener('error', () => {
  if (dialog.open) error.textContent = 'This scene could not load. Close the window and try again.';
});
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  video.pause();
  video.removeAttribute('src');
  video.load();
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
