# Visual QA Checklist

## Profile image regression

- [x] Profile editor fetches the signed-in profile instead of an optional local-storage record.
- [x] Avatar component clears a prior image failure when its `src` changes.
- [x] New avatar upload dispatches an in-app update for the header avatar.
- [x] In a signed-in browser: existing GridFS avatar appears in the header, edit mode, preview mode, and after refresh.
- [ ] Upload a replacement; verify preview, header, reload, and fallback behavior.

## Responsive/manual release checks

- [ ] 360px: top bar, profile sections, avatar, tabs, and bottom navigation.
- [ ] 768px: people, chat, Build, Experience, and admin tables/cards.
- [ ] Desktop: primary navigation, profile preview, message list/detail split, and public profiles.
- [ ] Keyboard: chat composer remains visible; back navigation returns to the conversation list.
- [ ] Broken/missing avatar and cover URLs render the shared fallback, never a broken-image icon.

## Phase 5.1 execution status

- [x] Local login page and unauthenticated session guards were reached.
- [x] Demo sign-in completed through a host-network server.
- [ ] Avatar replacement and upload-error tests require a browser session with file-chooser support.
- [ ] Cross-user and full authenticated responsive QA require additional isolated browser profiles.
