# Hero Creator Console - Lab-Styled Update Required

The HeroCreatorConsole component currently uses custom dark theme styling that doesn't match the Creator Lab™ aesthetic.

## What Needs to Change

### Current Style (Dark/Purple Theme)
```tsx
<div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
  <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
    <h2 className="text-purple-400">...</h2>
  </div>
</div>
```

### Target Style (Lab/Scientific Theme)
```tsx
<div className="space-y-6">
  <div className="lab-card">
    <div className="lab-card-header">
      <h3 className="lab-card-title">...</h3>
    </div>
    <div className="lab-card-body">
      ...
    </div>
  </div>
</div>
```

## Lab Design System Classes

From `/app/control-lab.css`:

### Panels
- `.lab-panel` - Main collapsible panel container
- `.lab-panel-header` - Collapsible header
- `.lab-panel-body` - Panel content area
- `.lab-panel-title` - Header title with icon

### Cards
- `.lab-card` - Card container
- `.lab-card-header` - Card header
- `.lab-card-title` - Card title
- `.lab-card-body` - Card content

### Forms
- `.lab-input` - Text input
- `.lab-textarea` - Textarea
- `.lab-select` - Select dropdown
- `.lab-button` - Primary button
- `.lab-button-secondary` - Secondary button

### Colors
- `var(--lab-primary)` - #0ea5e9 (cyan/blue)
- `var(--lab-text-primary)` - #0f172a (dark)
- `var(--lab-text-secondary)` - #475569 (gray)
- `var(--lab-border)` - #cbd5e1 (light gray)
- `var(--lab-bg-panel)` - #ffffff (white)

## Quick Fix Option

Since the Hero Creator Console is already inside a `lab-panel` in the Creator Lab page, the simplest fix is to **remove the outer container** and dark styling, keeping just the functional inner content with lab classes.

The component should blend seamlessly with the rest of the Creator Lab panels.

## Status

Component needs styling update to match lab aesthetic. Functional code is good, just visual styling needs adjustment.

