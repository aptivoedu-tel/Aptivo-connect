# Known Issues / Verification Gaps

1. The production build emits a non-blocking Ably transitive-dependency warning: `keyv` uses a dynamic dependency expression. Build and type validation pass.
2. Real-time chat, reconnect recovery, project-group authorization, and two-session delivery were not live verified in this audit because two authenticated test sessions were not available in the local runtime.
3. Some legacy pages still cache convenience data in `localStorage`. Security-sensitive APIs derive identity from the signed session; the profile editor has been moved fully to the session-backed load path.
4. The profile-image correction has static/type validation. It still needs one signed-in visual confirmation after deploying or starting a stable local server.
5. **Verification-environment limitation:** the restricted sandbox cannot open Atlas shard TCP connections, while normal host access can. Run Atlas-backed local verification with normal host network access.
6. **Verification-environment limitation:** only one in-app browser profile was available. Cross-user avatar checks, two-user realtime, project membership, and reconnect verification require independently authenticated browser sessions.
