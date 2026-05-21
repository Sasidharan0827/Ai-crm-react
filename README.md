# AI-First CRM HCP Module

Frontend for a life sciences CRM workflow focused on healthcare professional (HCP) interaction logging. The app provides two working modes:

- A structured form for creating HCP interactions
- A conversational copilot for CRM tasks such as listing HCPs, inspecting profiles, logging visits, editing records, and suggesting next actions

## Stack

- React 19
- Redux Toolkit
- Vite
- Backend API expected at `http://localhost:8000` by default

## Features

- Load HCP records from the backend
- View recent interaction history in a timeline
- Create interactions with structured fields
- Send conversational prompts to an agent endpoint
- Refresh interaction data after agent-driven updates

## Environment

Create a local `.env` file if you need to override the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The default value already matches `.env.example`.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Backend Contract

The frontend expects these API endpoints:

- `GET /api/hcps`
- `GET /api/interactions`
- `POST /api/interactions`
- `POST /api/agent/run`

The agent endpoint should return a JSON payload with a `reply` field for the assistant response.

## Project Structure

```text
src/
  App.jsx       Main UI for structured logging, copilot chat, and activity timeline
  main.jsx      React entry point
  store.js      Redux store, async thunks, and CRM state
  styles.css    Application styling
```

## Usage Notes

- The structured form converts `products_discussed` from a comma-separated input into an array before submitting.
- The app fetches HCPs and interactions on initial load.
- After a successful interaction create or agent action, interaction data is refreshed.
