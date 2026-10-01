# Aptivo Connect WebView Readiness

## Ready

- Responsive App Router routes with stable web URLs.
- HTTP-only, same-site session cookie authentication.
- Safe-area spacing for the dashboard and mobile bottom navigation.
- HTML file picker upload flow for profile and admin media.
- GridFS-backed durable media URLs (`/api/avatar/:id`).
- External profile links are validated as HTTP/HTTPS URLs.

## Native wrapper responsibilities

- Open external profile, portfolio, repository, demo, and meeting URLs in the system browser.
- Preserve cookies and website storage inside the WebView; do not clear the WebView data store between launches.
- Map Android back actions to `webView.canGoBack()` and `webView.goBack()` before exiting the app. Connect routes preserve ordinary browser history; direct detail and conversation URLs provide an in-app fallback instead of leaving the WebView.
- Ensure keyboard resize/pan behavior keeps mobile chat and form actions visible.
- Provide camera/gallery permission and file chooser handling for uploads.
- Configure deep-link/app-link routing to the same HTTPS web routes.

## Known risks to validate in a wrapper

- OAuth is not currently implemented; any future provider sign-in needs browser-to-app callback handling.
- Download behavior has not been implemented/tested for native WebViews.
- Ably realtime requires WebSocket-capable WebView networking and valid Vercel/Ably environment configuration.
- Push notifications and native share sheets are not implemented.

## Security notes

- Keep `SESSION_SECRET` and `ABLY_API_KEY` server-only in Vercel environment variables.
- Never inject these values into WebView JavaScript or public runtime configuration.
