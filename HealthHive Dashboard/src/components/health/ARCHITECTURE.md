# Jagna Health Data Management System - Architecture

## 70% Density Normalization

All dashboard pages use consistent **70% visual density** with **no transform scaling**. Everything is sized via width/height/padding, not CSS transforms.

---

## Layout Shell Structure

### Viewport (1440×900)
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar_Static (168px) │ ContentViewport (Fill)       │
│  ┌──────────────────┐    │ ┌──────────────────────────┐│
│  │                  │    │ │ TopBar (sticky)          ││
│  │  Navigation      │    │ ├──────────────────────────┤│
│  │  Links           │    │ │                          ││
│  │                  │    │ │ MainContent (max 1008px) ││
│  │  Fixed,          │    │ │ ┌──────────────────────┐ ││
│  │  Does NOT        │    │ │ │  Page Content        │ ││
│  │  scroll          │    │ │ │  - Scrolls vertically│ ││
│  │                  │    │ │ │  - Centered          │ ││
│  │                  │    │ │ │  - 70% width         │ ││
│  │                  │    │ │ └──────────────────────┘ ││
│  └──────────────────┘    │ └──────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

1. **Sidebar_Static** (168px)
   - Fixed width: 168px (70% of 240px)
   - Height: 100vh
   - Does NOT scroll
   - Position: Fixed/sticky left side
   - Layer: Above content (z-index higher)

2. **ContentViewport**
   - Width: Fill remaining space
   - Height: 100vh
   - Overflow-y: Auto (scrollable)
   - Overflow-x: Hidden
   - Contains TopBar + MainContent

3. **TopBar**
   - Width: 100% (full width of ContentViewport)
   - Sticky: top 0
   - Does NOT scroll with content
   - Background: White with border-bottom

4. **MainContent**
   - Max-width: 1008px (70% of 1440px)
   - Min-width: 320px
   - Padding: 24px (px-6)
   - Margin: Auto (centered)
   - Scrolls vertically

---

## 70% Sizing Scale

All measurements are 70% of original design:

| Element | 100% | 70% | Tailwind Class |
|---------|------|-----|----------------|
| Sidebar width | 240px | 168px | `w-[168px]` |
| Content max-width | 1440px | 1008px | `max-w-[1008px]` |
| Page padding | 32px | 24px | `px-6 py-4` |
| Card padding | 24px | 16px | `p-3` |
| Section gap | 24px | 16px | `gap-4` / `space-y-4` |
| Inner gap | 16px | 12px | `gap-3` |
| Small gap | 12px | 8px | `gap-2` |
| H1 font size | 28px | 20px | Default `h2` |
| H2 font size | 20px | 16px | Default `h3` |
| Body font size | 16px | 12-13px | `text-xs` |
| Small text | 14px | 10-11px | `text-[10px]` |
| Icon size | 20px | 14px | `size={14}` |
| Chart height | 300px | 210px | `height={210}` |
| Button height | 32px | 24px | `h-7` |
| Badge height | 24px | 16px | `h-4` |

---

## No Transform Scaling

**IMPORTANT**: No element uses `transform: scale()`. All scaling is achieved through:
- Width/height properties
- Padding/margin adjustments
- Font-size classes
- Gap/space utilities

❌ **Bad (Don't use)**:
```tsx
<div style={{ transform: 'scale(0.7)' }}>
  <Card>Content</Card>
</div>
```

✅ **Good (Use this)**:
```tsx
<Card className="p-3">  {/* Padding at 70% */}
  <CardContent className="text-xs">  {/* Font size at 70% */}
    Content
  </CardContent>
</Card>
```

---

## One Scroll Area

Only **ContentViewport** scrolls vertically. Everything else is:
- Fixed position (Sidebar)
- Sticky position (TopBar)
- Or contained within the scrolling area

**Test**: When scrolling down any page:
- ✅ Sidebar stays visible and fixed
- ✅ TopBar stays at top (sticky)
- ✅ Page content scrolls smoothly
- ✅ No nested scrollbars
- ✅ No transform/scale changes

---

## Page Structure Template

Every page follows this structure:

```tsx
export function SomePage() {
  return (
    <div className="py-4 space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-slate-900 mb-0.5">Page Title</h2>
        <p className="text-slate-600 text-xs">Description</p>
      </div>

      {/* Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>...</Card>
        <Card>...</Card>
        <Card>...</Card>
      </div>

      {/* Section 2 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Chart Title</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart>...</BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* More sections... */}
    </div>
  );
}
```

---

## Responsive Behavior

Container stays centered and respects min/max widths:

| Viewport | Container Behavior |
|----------|-------------------|
| ≤ 320px | Min-width enforced, horizontal scroll if needed |
| 321-1008px | Width fills viewport (with padding) |
| ≥ 1009px | Max-width 1008px, centered |

---

## Pages Using This Architecture

All pages use the normalized structure:

1. ✅ **OverviewPage** - Dashboard overview
2. ✅ **AnalyticsPage** (3 tabs) - DM, HTN, Cohorts analysis
3. ✅ **FieldOpsPage** - Field operations with map
4. ✅ **RegistryPage** - Patient registry
5. ✅ **DataQualityPage** - Data quality monitoring
6. ✅ **ResourcesPage** - Stock management
7. ✅ **AdminPage** - Admin settings

---

## Code Organization

```
components/health/
├── AppShell.tsx          # Master layout shell (Sidebar + Content)
├── PageTemplate.tsx      # Reusable page template
├── HealthSidebar.tsx     # 168px fixed sidebar
├── TopBar.tsx            # Sticky top navigation
├── pages/
│   ├── OverviewPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── FieldOpsPage.tsx
│   ├── RegistryPage.tsx
│   ├── DataQualityPage.tsx
│   ├── ResourcesPage.tsx
│   └── AdminPage.tsx
└── ARCHITECTURE.md       # This file
```

---

## Sanity Checks

Run these tests on each page:

1. ✅ **Scroll Test**: Scroll to bottom - sidebar stays fixed, TopBar sticky
2. ✅ **Width Test**: Resize from 360px → 1920px - content stays centered, max 1008px
3. ✅ **Scale Test**: Inspect all elements - no `transform: scale()` anywhere
4. ✅ **Consistency Test**: Compare Overview vs Analytics vs Registry - same spacing, fonts, gaps
5. ✅ **Chart Test**: All charts are 210px height (not 300px)
6. ✅ **Typography Test**: No `text-base` or `text-sm` on body content - use `text-xs` or `text-[10px]`

---

## Design Tokens (70% Density)

```css
/* Spacing Scale (70%) */
--space-1: 4px   (gap-1)
--space-2: 8px   (gap-2)
--space-3: 12px  (gap-3)
--space-4: 16px  (gap-4, space-y-4)
--space-6: 24px  (px-6, py-6)

/* Type Scale (70%) */
--text-h1: 20px  (h2 element)
--text-h2: 16px  (h3 element)
--text-h3: 14px  (text-sm)
--text-body: 12px (text-xs)
--text-small: 10px (text-[10px])

/* Component Sizes (70%) */
--sidebar: 168px
--button: 24px height
--badge: 16px height
--icon: 14px
--chart: 210px height
```

---

## Migration Checklist

When adding a new page or updating existing:

- [ ] Remove any `transform` or `scale` CSS
- [ ] Use `py-4 space-y-4` for page wrapper
- [ ] Cards use `p-3` or `pb-2`/`pt-0`
- [ ] Body text uses `text-xs`
- [ ] Small text uses `text-[10px]`
- [ ] Icons are `size={12}` to `size={16}`
- [ ] Charts are `height={210}`
- [ ] Gaps use `gap-3` or `gap-4`
- [ ] No nested scroll containers
- [ ] Test: sidebar fixed, content scrolls
- [ ] Test: responsive from 320px to 1920px
