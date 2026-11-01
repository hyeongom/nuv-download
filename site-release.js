'use strict';
// Fetch only the public release feed. Questions and troubleshooting inputs stay in this page.
fetch('version.json', {cache: 'no-store'}).then(response => {
  if (!response.ok) throw new Error('Release feed unavailable');
  return response.json();
}).then(feed => {
  const allowed = value => typeof value === 'string' && /^https:\/\/github\.com\/hyeongom\/nuv-download\/releases\/download\//.test(value);
  document.querySelectorAll('[data-version]').forEach(node => {
    const value = feed[node.dataset.version];
    if (typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value)) node.textContent = value;
  });
  document.querySelectorAll('[data-download]').forEach(node => {
    const value = feed.downloads?.[node.dataset.download];
    if (allowed(value)) node.href = value;
  });
  const extension = Object.entries(feed.downloads || {}).find(([name]) => name.startsWith('NUV-Browser-Extension-'));
  if (extension && allowed(extension[1])) document.querySelector('[data-extension-download]').href = extension[1];
  if (typeof feed.notes === 'string' && feed.notes.trim()) document.querySelector('#latest-pc-notes').textContent = feed.notes;
}).catch(() => { /* Keep the verified download links supplied in the HTML. */ });
