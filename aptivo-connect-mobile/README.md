# Aptivo Connect Mobile

This is a thin Expo WebView wrapper around the deployed Aptivo Connect web app. It intentionally does not duplicate any product screens, APIs, authentication, or client state.

## Local configuration

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_CONNECT_URL` to the deployed HTTPS Connect URL. Set `EXPO_PUBLIC_EAS_PROJECT_ID` after creating the EAS project. Neither value is a server secret.

Use `npm run start`, `npm run typecheck`, and `npm run doctor`. Push notifications require a development or production build; Expo Go cannot validate remote Android notifications for this SDK.

## Server configuration

The Next.js application owns device registration at `/api/push/devices`, deriving the user solely from the signed session cookie. `EXPO_PUSH_ACCESS_TOKEN`, if used, stays only in the Next.js server environment.

## Owner setup required

- Confirm final Android/iOS bundle identifiers.
- Supply approved application and monochrome Android notification icons.
- Configure EAS, FCM, APNs, and production deployment URL before physical-device push testing.
