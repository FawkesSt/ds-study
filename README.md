# Design System Pipeline
## Figma Variables → Tokens Studio → GitHub → Style Dictionary → React

---

## Overview

This document covers the complete workflow to build a token-based design system pipeline from Figma to production React components.

```
Figma Variables (3 collections)
        ↓  Tokens Studio plugin
tokens/tokens.json on GitHub
        ↓  Style Dictionary v5
dist/tokens.css (CSS custom properties)
        ↓  React import
Button component in browser
```

---

## Prerequisites

- Figma account (free tier works)
- Tokens Studio plugin installed in Figma (free tier)
- GitHub account
- Node.js installed (v18+)
- VS Code or any code editor

---

## Part 1 — Token Architecture

### The Three-Tier Model

Every token belongs to one of three tiers. Never skip tiers or mix them.

```
TIER 1: PRIMITIVES — raw values only
  color/blue/500    = #2563EB
  space/12          = 12
  radius/8          = 8

TIER 2: SEMANTIC — meaning layer, references Primitives
  color/action/primary       → color/blue/500
  space/component/padding-v  → space/12

TIER 3: COMPONENT — scoped to one component, references Semantic
  button/background/default  → color/action/primary
  button/padding/vertical    → space/component/padding-v
```

### Naming Convention

```
[category] / [concept] / [variant] / [state]

Rules:
→ All lowercase
→ Slashes as separators
→ State is always the last segment
→ Never name by value ("blue-button" ❌, "action-primary" ✅)
→ Primitives: named by value (color/blue/500)
→ Semantic: named by meaning (color/action/primary)
→ Component: named by component first (button/background/default)
```

---

## Part 2 — Figma Setup

### Variable Collections

Create three collections in this exact order in Figma Variables panel:

**Collection 1: Primitives**
```
color/blue/200    #BFDBFE
color/blue/500    #2563EB
color/blue/600    #1D4ED8
color/neutral/0   #FFFFFF
color/neutral/300 #D1D5DB
space/12          12
space/16          16
radius/8          8
typography/font-size/14    14
typography/font-weight/600 600
```

**Collection 2: Semantic**
```
action/primary           → color/blue/500
action/primary/hover     → color/blue/600
action/primary/disabled  → color/blue/200
text/inverse             → color/neutral/0
text/disabled            → color/neutral/300
space/component/padding-v → space/12
space/component/padding-h → space/16
radius/md                → radius/8
typography/label/size    → typography/font-size/14
typography/label/weight  → typography/font-weight/600
```

**Collection 3: Components**
```
button/background/default  → action/primary
button/background/hover    → action/primary/hover
button/background/disabled → action/primary/disabled
button/label/color         → text/inverse
button/label/color-disabled → text/disabled
button/label/size          → typography/label/size
button/label/weight        → typography/label/weight
button/padding/vertical    → space/component/padding-v
button/padding/horizontal  → space/component/padding-h
button/radius              → radius/md
```

### Critical Figma Rules

```
✅ Type must match: Color variables = Color type, spacing = Number type
✅ Always type the full path when creating variables (action/primary not just "primary")
✅ Semantic and Component variables must never contain raw values — only references
✅ Apply only Component tokens to components — never Primitives or Semantic directly
```

### Button Component Setup

```
1. Build three frames: Default, Hover, Disabled
2. Apply component tokens to every property:
   Frame fill    → button/background/default (or hover/disabled)
   Label color   → button/label/color
   Padding H     → button/padding/horizontal
   Padding V     → button/padding/vertical
   Corner radius → button/radius
3. Select all three → Right click → Combine as Variants
4. Rename Property 1 → State
5. Name variants: Default / Hover / Disabled
6. Add Text property for Label
7. Use Auto Layout — never fixed widths
```

---

## Part 3 — GitHub Repository Setup

### Initialize the project

```bash
# Create and clone the repo from GitHub first, then:
cd your-repo-name
npm init -y
npm install style-dictionary
npm install react react-dom
npm install --save-dev vite @vitejs/plugin-react

# Create folder structure
mkdir -p tokens dist src/components/Button
```

### package.json

Critical: must have `"type": "module"` and `build:tokens` must use `node` not the CLI.

```json
{
  "name": "ds-study",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build:tokens": "node sd.config.js",
    "dev": "vite"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "style-dictionary": "^5.3.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.0",
    "vite": "^8.0.0"
  }
}
```

---

## Part 4 — Token JSON

Create `tokens/tokens.json`. This is the single source of truth shared between Tokens Studio and Style Dictionary.

```json
{
  "Primitives": {
    "color": {
      "blue": {
        "200": { "value": "#BFDBFE", "type": "color" },
        "500": { "value": "#2563EB", "type": "color" },
        "600": { "value": "#1D4ED8", "type": "color" }
      },
      "neutral": {
        "0":   { "value": "#FFFFFF", "type": "color" },
        "300": { "value": "#D1D5DB", "type": "color" }
      }
    },
    "space": {
      "12": { "value": "12", "type": "spacing" },
      "16": { "value": "16", "type": "spacing" }
    },
    "radius": {
      "8": { "value": "8", "type": "borderRadius" }
    },
    "typography": {
      "font-size": {
        "14": { "value": "14", "type": "fontSizes" }
      },
      "font-weight": {
        "600": { "value": "600", "type": "fontWeights" }
      }
    }
  },
  "Semantic": {
    "action": {
      "primary":          { "value": "{color.blue.500}",   "type": "color" },
      "primary-hover":    { "value": "{color.blue.600}",   "type": "color" },
      "primary-disabled": { "value": "{color.blue.200}",   "type": "color" }
    },
    "text": {
      "inverse":  { "value": "{color.neutral.0}",   "type": "color" },
      "disabled": { "value": "{color.neutral.300}", "type": "color" }
    },
    "space": {
      "component": {
        "padding-v": { "value": "{space.12}", "type": "spacing" },
        "padding-h": { "value": "{space.16}", "type": "spacing" }
      }
    },
    "radius": {
      "md": { "value": "{radius.8}", "type": "borderRadius" }
    },
    "typography": {
      "label": {
        "size":   { "value": "{typography.font-size.14}",    "type": "fontSizes" },
        "weight": { "value": "{typography.font-weight.600}", "type": "fontWeights" }
      }
    }
  },
  "Components": {
    "button": {
      "background": {
        "default":  { "value": "{action.primary}",          "type": "color" },
        "hover":    { "value": "{action.primary-hover}",    "type": "color" },
        "disabled": { "value": "{action.primary-disabled}", "type": "color" }
      },
      "label": {
        "color":          { "value": "{text.inverse}",                    "type": "color" },
        "color-disabled": { "value": "{text.disabled}",                   "type": "color" },
        "size":           { "value": "{typography.label.size}",           "type": "fontSizes" },
        "weight":         { "value": "{typography.label.weight}",         "type": "fontWeights" }
      },
      "padding": {
        "vertical":   { "value": "{space.component.padding-v}", "type": "spacing" },
        "horizontal": { "value": "{space.component.padding-h}", "type": "spacing" }
      },
      "radius": { "value": "{radius.md}", "type": "borderRadius" }
    }
  }
}
```

### Why collection wrappers stay in the JSON

Tokens Studio Free requires the collection wrapper keys (`Primitives`, `Semantic`, `Components`) in the JSON. Style Dictionary v5 handles the unwrapping via a preprocessor in `sd.config.js` — never remove them from the JSON.

---

## Part 5 — Style Dictionary Config

Create `sd.config.js` in the project root.

```javascript
import StyleDictionary from 'style-dictionary'

// Deep merge helper — needed because Primitives and Semantic
// share top-level keys (space, radius, typography).
// Object.assign would overwrite them. deepMerge combines them.
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !source[key].value
    ) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// Strips Primitives/Semantic/Components wrappers before
// Style Dictionary resolves references
StyleDictionary.registerPreprocessor({
  name: 'strip-collection-wrappers',
  preprocessor: (dictionary) => {
    const collectionKeys = ['Primitives', 'Semantic', 'Components']
    const result = {}

    for (const [key, value] of Object.entries(dictionary)) {
      if (collectionKeys.includes(key)) {
        deepMerge(result, value)
      } else {
        result[key] = value
      }
    }

    return result
  }
})

const sd = new StyleDictionary({
  log: { verbosity: 'verbose' },
  source: ['tokens/tokens.json'],
  preprocessors: ['strip-collection-wrappers'],
  hooks: {
    transforms: {
      // Tokens Studio stores dimension values as unitless numbers.
      // This transform adds px on build so Figma values stay clean.
      'dimension/px': {
        type: 'value',
        filter: (token) => [
          'dimension',
          'spacing',
          'borderRadius',
          'fontSizes',
        ].includes(token.type),
        transform: (token) => {
          const val = parseFloat(token.value)
          return isNaN(val) ? token.value : `${val}px`
        }
      }
    },
    transformGroups: {
      'css/custom': [
        'name/kebab',
        'color/css',
        'dimension/px',
      ]
    }
  },
  platforms: {
    css: {
      transformGroup: 'css/custom',
      prefix: 'ds',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables'
        }
      ]
    }
  }
})

await sd.buildAllPlatforms()
```

### Common errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `registerTransform is not a function` | Wrong SD version API | Use `hooks.transforms` (v5 syntax) |
| `name/cti/kebab not found` | v4 transform name | Use `name/kebab` |
| Values output as `rem` | Unitless numbers | Expand filter to include Tokens Studio types |
| `Cannot use import statement` | Wrong module type | Set `"type": "module"` in package.json |
| `build:tokens` still uses CLI | Script not updated | Change to `"node sd.config.js"` |

---

## Part 6 — React Button Component

### File structure

```
src/
└── components/
    └── Button/
        ├── Button.jsx
        └── Button.css
```

### Button.jsx

```jsx
import './Button.css'

export function Button({
  variant  = 'primary',
  disabled = false,
  onClick,
  children,
}) {
  return (
    <button
      className={[
        'ds-button',
        `ds-button--${variant}`,
        disabled ? 'ds-button--disabled' : '',
      ].join(' ')}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
    >
      <span className="ds-button__label">{children}</span>
    </button>
  )
}
```

### Button.css

```css
.ds-button {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  border:          none;
  cursor:          pointer;
  border-radius:   var(--ds-button-radius);
  padding:         var(--ds-button-padding-vertical)
                   var(--ds-button-padding-horizontal);
  font-size:       var(--ds-button-label-size);
  font-weight:     var(--ds-button-label-weight);
  transition:      background 150ms ease;
}

.ds-button--primary {
  background: var(--ds-button-background-default);
  color:      var(--ds-button-label-color);
}

.ds-button--primary:hover:not(:disabled) {
  background: var(--ds-button-background-hover);
}

.ds-button--disabled,
.ds-button:disabled {
  background: var(--ds-button-background-disabled);
  color:      var(--ds-button-label-color-disabled);
  cursor:     not-allowed;
}
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Design System Study</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '../dist/tokens.css'
import { Button } from './components/Button/Button'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: '40px', display: 'flex', gap: '16px' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  </React.StrictMode>
)
```

---

## Part 7 — Tokens Studio GitHub Sync

### Step 1 — Generate a GitHub Personal Access Token

```
github.com → Settings → Developer settings
→ Personal access tokens → Tokens (classic)
→ Generate new token (classic)
→ Name: tokens-studio
→ Scope: repo (full)
→ Generate and copy immediately
```

### Step 2 — Configure Tokens Studio

```
Figma → Tokens Studio plugin → Settings tab
→ Sync providers → Add new → GitHub

Name:        your-repo-name
Repository:  your-username/your-repo-name
Branch:      main
File path:   tokens/tokens.json
Token:       paste GitHub personal access token
```

### Step 3 — Activate token sets

All three sets must be checked in the main Tokens panel:

```
✅ Primitives
✅ Semantic
✅ Components
```

### Step 4 — Pull before push

Always pull first to sync existing repo content into the plugin before pushing.

### Correct workflow

```
Tokens Studio is the source of truth for editing.
Figma Variables is the output — updated by Tokens Studio.

✅ CORRECT: Edit in Tokens Studio → Push to GitHub → run build:tokens
❌ WRONG:   Edit in Figma Variables → try to sync to Tokens Studio
```

---

## Part 8 — Running the Pipeline

### Build tokens

```bash
npm run build:tokens
```

Generates `dist/tokens.css` from `tokens/tokens.json`.

### Run the app

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Proof of concept test

Change one primitive value in `tokens/tokens.json`:

```json
"500": { "value": "#7C3AED", "type": "color" }
```

Run `npm run build:tokens` and refresh the browser. The button turns purple. One value changed, everything updated. Revert to `#2563EB` when done.

---

## Part 9 — Git Workflow

### Commit conventions

```
type(scope): short description

Types:
  feat     → new feature
  fix      → bug fix
  chore    → config, maintenance
  docs     → documentation
  refactor → code change, no new feature

Examples:
  feat(tokens): setup Style Dictionary v5 pipeline
  fix(tokens): fix preprocessor deep merge and px transform
  chore(tokens): sync primitives from Figma
  feat(button): add hover and disabled states
```

### First commit

```bash
git add .
git commit -m "feat(tokens): setup Style Dictionary v5 pipeline

- Add three-tier token architecture (primitives, semantic, components)
- Configure Style Dictionary v5 with custom dimension/px transform
- Generate dist/tokens.css from token source files
- Add Button component consuming CSS custom properties"

git push origin main
```

---

## Final File Structure

```
ds-study/
├── tokens/
│   └── tokens.json          ← source of truth, edit here
├── dist/
│   └── tokens.css           ← generated, never edit manually
├── src/
│   └── components/
│       └── Button/
│           ├── Button.jsx
│           └── Button.css
├── index.html
├── sd.config.js
├── package.json
└── .gitignore               ← only node_modules
```

---

## Quick Reference

| Task | Command |
|---|---|
| Build tokens | `npm run build:tokens` |
| Run dev server | `npm run dev` |
| Commit and push | `git add . && git commit -m "..." && git push` |
| Add new token | Edit `tokens/tokens.json` → run build |
| Sync from Figma | Tokens Studio → Push → run build |
