# Personal Mind Map 🧠

*Read this in other languages: [Czech / Česky](README-CZ.md)*

A modern Next.js application designed to create, manage, and visualize personal mind maps. It allows users to visually organize their thoughts, connect ideas, and get AI-powered insights into their mental models using an organic graph or a structured tree view.

## ✨ Core Features

- **AI Personality Analysis:** Instantly export your mind map into a structured Markdown prompt. Copy and paste it into ChatGPT, Claude, or Gemini to get psychological insights and a deep analysis of your mental patterns and cross-links.
- **Two views for identical data:** Toggle seamlessly between the "Space" view (a physically simulated cluster using Force Graph) and the "Tree" view (a hierarchically formatted diagram using React Flow).
- **Create and manage maps:** Easily create multiple mind maps to organize different topics, ideas, or projects.
- **Advanced node management:** Nodes support deep nesting (`parent_id`), arbitrary interconnecting (`cross_links`), and collapsible container mechanics (`collapsible`).
- **Smart branch moving:** In the "Tree" view, toggle the "Move including descendants" feature to effortlessly drag and reorganize an entire logical branch at once.
- **Physical engine customization:** Fine-tune the organic physics layout in the "Space" view by adjusting attributes like mass, bond length, and custom JSON styling.

## 🚀 How to Run the App Quickly

You only need a few simple commands to get the app running locally on your machine.

### 1. Install dependencies
```bash
npm install
```

### 2. Initialize the Database & Add Sample Data
This will create the local SQLite database (`mindmap.db`) and seed it with a beautiful sample map to test out the features.
```bash
npx drizzle-kit push
npx tsx scripts/seed-map.ts
```

### 3. Start the Application
```bash
npm run dev
```

That's it! 🎉 Open [http://localhost:3000](http://localhost:3000) in your browser. You can select your map in the top navigation bar and try out the AI analysis or view toggles.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** SQLite (local `mindmap.db`) with Drizzle ORM
- **Visualization:** `@xyflow/react` (Tree), `react-force-graph-2d` (Space)
