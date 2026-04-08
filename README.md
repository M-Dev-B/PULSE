# Pulse ✨

Pulse is a modern, real-time collaborative whiteboard and workspace application built with Next.js, Liveblocks, and AI integration. It allows teams to brainstorm, draw, and build ideas together seamlessly.

## 🚀 Features

- **Real-Time Collaboration**: Multi-player whiteboards powered by [Liveblocks](https://liveblocks.io/) and [Excalidraw](https://excalidraw.com/). See what your teammates are drawing in real time.
- **AI-Powered Assistance**: Integrated with Google Generative AI to chat, brainstorm, and generate content directly within your workspace.
- **Interactive Dashboard**: A beautiful interface to manage, create, and organize your boards.
- **Authentication**: Secure user authentication and session management using [Clerk](https://clerk.com/).
- **Stunning UI/UX**: Crafted with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/), featuring dynamic WebGL backgrounds (`ogl`), fluid animations (`framer-motion`, `gsap`), and seamless dark/light mode support (`next-themes`).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Collaboration**: Liveblocks (`@liveblocks/client`, `@liveblocks/react`)
- **Whiteboard**: Excalidraw (`@excalidraw/excalidraw`)
- **AI**: Google Generative AI (`@google/generative-ai`)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Animations**: Framer Motion, GSAP, Tw-animate-css

## 💻 Getting Started

### Prerequisites

Make sure you have Node.js installed.

### Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables by creating a `.env.local` file. You will need API keys for:
   - Clerk (Authentication)
   - Liveblocks (Real-time collaboration)
   - Google Generative AI (AI features)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Adding Components

To add more UI components to your app, you can use the shadcn/ui CLI:

```bash
npx shadcn@latest add [component-name]
```

These will be placed in the `components/ui` directory.
