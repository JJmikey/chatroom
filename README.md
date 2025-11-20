# Chatroom

An Astro + Svelte chat interface that stores conversations remotely and replies with AI-generated responses. The UI splits the experience into a conversation list and a chat panel so you can jump between threads while keeping messages persisted in a Cloudflare Worker-powered API.

## Features
- Create, browse, and delete conversations that are saved through the Chat Storage Worker API.
- Compose messages and receive AI replies from the Gemini Worker endpoint, rendered with a typewriter effect.
- Responsive layout with a sidebar conversation list on desktop and a mobile-friendly toggle between list and chat views.
- Markdown rendering for AI messages, plus basic typing indicators while the model responds.

## Tech stack
- **Astro** for the site shell with **Svelte** components powering the interactive UI.
- **TypeScript** in Svelte components for type safety and store management.
- Remote APIs: `ChatStorageSDK` communicates with the Chat Storage Worker, and chat prompts are sent to the Gemini Worker.

## Project structure
```
/
├── public/
├── src/
│   ├── components/      # App shell, conversation list, chat box
│   ├── layouts/         # Base page layout
│   ├── pages/           # Astro pages (index.astro is the entrypoint)
│   ├── stores/          # UI and conversation selection state
│   └── utils/           # ChatStorageSDK for remote persistence
├── package.json
└── tsconfig.json
```

## Getting started
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the dev server:
   ```sh
   npm run dev
   ```
   The site runs at http://localhost:4321 by default.
3. Build for production:
   ```sh
   npm run build
   ```
4. Preview the production build locally:
   ```sh
   npm run preview
   ```

## Configuration notes
- The chat storage base URL is defined in `src/utils/chat-storage-sdk.js` and currently targets `https://chat-storage.ktkt0099ktkt.workers.dev`.
- AI responses are fetched from `https://gemini-rust-worker.ktkt0099ktkt.workers.dev/chat`. Update these endpoints if you are running your own backing services.

## Learn more
- [Astro documentation](https://docs.astro.build)
- [Svelte documentation](https://svelte.dev/docs)
