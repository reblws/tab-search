// A local web server with the pages the overlay specs open over. The E2E
// builds may inject into http://127.0.0.1 (test/e2e-extension.js).
import http from 'http';

// Counts every keydown and focusin the page sees, even in the capture phase
const PROBE = `
  window.seen = { keydown: 0, focusin: 0 };
  addEventListener('keydown', () => { seen.keydown += 1; }, true);
  addEventListener('focusin', () => { seen.focusin += 1; }, true);
`;

const page = (title, body = '', script = '') => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;font:16px sans-serif">
<input id="page-input" placeholder="page input">
<p style="height:3000px">${title}</p>
${body}
<script>${PROBE}${script}</script>
</body></html>`;

const ROUTES = {
  // ?title= names the page, so specs can find its tab by title
  '/page': query => ({ body: page(query.get('title') || 'Fixture page') }),
  // Strict CSP: no frames, no styles, no scripts but the inline probe
  '/strict': () => ({
    headers: {
      'Content-Security-Policy': "default-src 'none'; frame-src 'none'; child-src 'none'; style-src 'none'; script-src 'unsafe-inline'",
    },
    body: page('Strict CSP page'),
  }),
  // A sandboxed page can't run the overlay's frame
  '/sandbox': () => ({
    headers: { 'Content-Security-Policy': 'sandbox allow-scripts' },
    body: page('Sandboxed page'),
  }),
  // A modal dialog, with a focus trap that pulls focus back into it
  '/modal': () => ({
    body: page(
      'Modal dialog page',
      '<dialog id="dialog"><button id="trap">Inside the dialog</button></dialog>',
      `document.getElementById('dialog').showModal();
       document.addEventListener('focusin', (e) => {
         const dialog = document.getElementById('dialog');
         if (!dialog.contains(e.target)) document.getElementById('trap').focus();
       }, true);`,
    ),
  }),
};

export function startFixtureServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const route = ROUTES[url.pathname];
    if (!route) {
      res.writeHead(404);
      res.end();
      return;
    }
    const { headers = {}, body } = route(url.searchParams);
    res.writeHead(200, Object.assign({ 'Content-Type': 'text/html; charset=utf-8' }, headers));
    res.end(body);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        url: (pathname, title) => `http://127.0.0.1:${port}${pathname}${title ? `?title=${encodeURIComponent(title)}` : ''}`,
        close: () => new Promise((done) => {
          // Browsers keep connections alive, which would hold close() open
          server.closeAllConnections();
          server.close(done);
        }),
      });
    });
  });
}
