# Compare TX

A browser-based tool to compare two Cardano transactions side by side. Paste two
hex-encoded CBOR transactions and get a structured, color-coded diff of their
decoded contents.

All decoding happens locally in your browser. Transactions are never sent to a
server.

## Features

- Decodes hex-encoded CBOR Cardano transactions into JSON using the Emurgo
  Cardano Serialization Library (WASM)
- Side-by-side recursive JSON tree diff with added, removed, and changed
  highlighting
- Synchronized scrolling between both panels
- Expand and collapse all nodes, plus per-node toggling
- Diff summary counts (added, removed, changed, unchanged)
- Nested JSON strings are detected and parsed so they can be diffed structurally
- Order-insensitive comparison for Plutus data witnesses
- Light, dark, and system theme support

## Tech Stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS v4
- Zustand for state management
- Radix UI primitives and lucide-react icons
- @emurgo/cardano-serialization-lib-browser (WASM)

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. Paste a hex-encoded CBOR transaction into the "Transaction 1" panel.
2. Paste a second transaction into the "Transaction 2" panel.
3. Click "Compare Transactions".
4. Review the side-by-side diff. Use "Expand All" and "Collapse All" to control
   the tree, or toggle individual nodes.

## Scripts

| Script          | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the development server      |
| `npm run build` | Build the production bundle       |
| `npm start`     | Serve the production build        |
| `npm run lint`  | Run ESLint                        |

## Project Structure

```
app/                      Next.js App Router entry (layout, page, global styles)
components/               UI components
  json-tree-view.tsx        Recursive diff tree renderer
  transaction-comparison-view.tsx  Side-by-side diff layout and scroll sync
  transaction-input-panel.tsx      Hex input panel
  site-header.tsx           Header with theme toggle
  theme-toggle.tsx          Light/dark/system switch
  ui/                       Shared primitives (button, input, textarea)
lib/
  cardano/parser.ts         Hex/CBOR to JSON decoding
  diff/engine.ts            JSON diff algorithm
  diff/types.ts             Diff type definitions
  utils.ts                  Shared helpers
store/
  comparison-store.ts       Comparison state (inputs, parse results, diff)
  theme-store.ts            Theme state and persistence
```

## How It Works

1. `lib/cardano/parser.ts` cleans and validates the input, then decodes it with
   `Transaction.from_hex` and serializes the body, witness set, and auxiliary
   data to JSON.
2. `lib/diff/engine.ts` recursively compares the two JSON trees, assigning each
   node a status of `added`, `removed`, `changed`, or `unchanged`, and tallies a
   summary.
3. The comparison view renders both transactions from the same diff tree,
   highlighting differences and keeping the two panels scroll-synced.

## License

Not yet specified.
