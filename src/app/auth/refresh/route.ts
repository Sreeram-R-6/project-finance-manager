export function GET() {
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Refreshing sign-in</title></head>
<body>
<p>Refreshing sign-in…</p>
<script>
(async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations
        .filter((registration) => [registration.active, registration.waiting, registration.installing]
          .some((worker) => worker && new URL(worker.scriptURL).pathname === '/sw.js'))
        .map((registration) => registration.unregister()));
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith('pfm-shell-'))
        .map((name) => caches.delete(name)));
    }
  } finally {
    location.replace('/login?error=callback');
  }
})();
</script>
</body>
</html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
