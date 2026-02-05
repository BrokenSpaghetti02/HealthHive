# Critical Design Fixes - Action Plan
**Date:** October 29, 2025  
**Status:** IN PROGRESS (Partial fixes applied)

---

## SUMMARY OF FIXES COMPLETED ✅

### Phase 1 - Completed
1. **OverviewPage** - Section divider padding: p-2 → p-3 (7 instances) ✅
2. **OverviewPage** - Info box padding: p-2 → p-3 (10 instances) ✅
3. **AnalyticsPage** - TabsList height: h-8 → h-7 ✅
4. **AnalyticsPage** - Info box padding: p-2 → p-3 (1 instance) ✅
5. **DataQualityPage** - Button heights: h-6 → h-7 (2 instances) ✅
6. **RegistryPage** - Badge heights: h-3.5 → h-4 (all instances) ✅
7. **RegistryPage** - Input height: h-6 → h-7 + icon size 12 → 14 ✅

---

## REMAINING CRITICAL ISSUES ⚠️

### 1. BUTTON HEIGHT INCONSISTENCIES (HIGH PRIORITY)

**Target:** All buttons should be h-7 (28px)

#### AdminPage.tsx
```tsx
Lines 33, 40, 65, 72: h-6 → h-7
Current: <Button size="sm" variant="outline" className="h-6 text-xs px-2">
Fix to:  <Button size="sm" variant="outline" className="h-7 text-xs px-2">
```

#### DataQualityPage.tsx
```tsx
Line 145: h-6 → h-7
Current: <Button size="sm" variant="outline" className="h-6 text-xs px-2">Fix</Button>
Fix to:  <Button size="sm" variant="outline" className="h-7 text-xs px-2">Fix</Button>
```

#### FieldOpsPage.tsx - Special Cases
```tsx
Lines 177, 181: h-5 → h-6 (Micro-actions can be slightly smaller)
Current: <Button size="sm" variant="outline" className="h-5 text-[10px]...">
Fix to:  <Button size="sm" variant="outline" className="h-6 text-[10px]...">

Note: These are Phone/Message micro-actions. h-6 is acceptable minimum for accessibility.
```

---

### 2. TABSLIST HEIGHT INCONSISTENCIES (HIGH PRIORITY)

**Target:** All TabsList should be h-7 (28px)

#### FieldOpsPage.tsx
```tsx
Line 108: h-8 → h-7
Current: <TabsList className="bg-[#F9FAFB] border border-[#D4DBDE] h-8">
Fix to:  <TabsList className="bg-[#F9FAFB] border border-[#D4DBDE] h-7">

Lines 109-112: Remove h-7 from individual TabsTriggers (now redundant)
Current: <TabsTrigger value="today" className="text-xs px-3 h-7">
Fix to:  <TabsTrigger value="today" className="text-xs px-3">
```

#### OverviewPage.tsx - BMI Tabs
```tsx
Line 514: h-6 → h-7
Current: <TabsList className="grid w-full grid-cols-2 h-6 p-[2px]">
Fix to:  <TabsList className="grid w-full grid-cols-2 h-7 p-[2px]">
```

---

### 3. BADGE HEIGHT INCONSISTENCIES (MEDIUM PRIORITY)

**Target:** All badges should be h-4 (16px)

#### FieldOpsPage.tsx
```tsx
Line 157: h-3.5 → h-4
Current: <Badge variant="outline" className="text-[10px] h-3.5 px-1 border-[#D4DBDE] ml-1.5">
Fix to:  <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-[#D4DBDE] ml-1.5">

Note: Also update px-1 → px-1.5 for consistency
```

---

### 4. CHART FONT SIZE INCONSISTENCIES (MEDIUM PRIORITY)

**Target:** All chart ticks should use fontSize: 10

#### OverviewPage.tsx
```tsx
Line 437: fontSize: 9 → fontSize: 10
Line 522: fontSize: 8 → fontSize: 10
Line 523: fontSize: 9 → fontSize: 10
Line 538: fontSize: 8 → fontSize: 10
Line 539: fontSize: 9 → fontSize: 10
Line 571: fontSize: 9 → fontSize: 10
Line 593: fontSize: 9 → fontSize: 10
Line 625: fontSize: 9 → fontSize: 10
Line 626: fontSize: 8 → fontSize: 10
```

#### AnalyticsPage.tsx
```tsx
Line 181: fontSize: 9 → fontSize: 10
Line 213: fontSize: 9 → fontSize: 10
Line 214: fontSize: 8 → fontSize: 10
Line 315: fontSize: 9 → fontSize: 10
Line 408: fontSize: 9 → fontSize: 10
Line 474: fontSize: 9 → fontSize: 10
Line 525: fontSize: 9 → fontSize: 10
Line 698: fontSize: 9 → fontSize: 10
Line 699: fontSize: 8 → fontSize: 10
Line 724: fontSize: 9 → fontSize: 10
Line 725: fontSize: 8 → fontSize: 10
```

**Exception:** Very small Y-axis labels on horizontal bar charts can use fontSize: 9 if needed for space.

---

### 5. INFO BOX PADDING - REMAINING FIXES (MEDIUM PRIORITY)

**Target:** All info boxes should use p-3

#### AnalyticsPage.tsx - 12 More Instances
```tsx
Line 165: mt-3 p-2 → mt-3 p-3
Line 187: mt-3 p-2 → mt-3 p-3
Line 325: mt-3 p-2 → mt-3 p-3
Line 350: mt-3 p-2 → mt-3 p-3
Line 414: mt-3 p-2 → mt-3 p-3
Line 458: mt-3 p-2 → mt-3 p-3
Line 480: mt-3 p-2 → mt-3 p-3
Line 535: mt-3 p-2 → mt-3 p-3
Line 673: mt-3 p-2 → mt-3 p-3
Line 707: mt-3 p-2 → mt-3 p-3
Line 733: mt-3 p-2 → mt-3 p-3
Line 791: mt-3 p-2 → mt-3 p-3
Line 815: mt-3 p-2 → mt-3 p-3
```

#### AnalyticsPage.tsx - Occupation Cards
```tsx
Lines 108, 496: p-2 bg-[#F9FAFB] → p-3 bg-[#F9FAFB]
Current: <div key={idx} className="p-2 bg-[#F9FAFB] rounded-md border border-[#D4DBDE]">
Fix to:  <div key={idx} className="p-3 bg-[#F9FAFB] rounded-md border border-[#D4DBDE]">
```

---

### 6. BORDER RADIUS INCONSISTENCIES (LOW PRIORITY)

**Target:** Standardize on rounded-md (6px)

#### Audit Required
- Check all cards, buttons, inputs
- Replace `rounded` (4px) with `rounded-md` (6px)
- Replace `rounded-lg` (8px) with `rounded-md` (6px)
- Exception: Keep `rounded-full` for circular elements

---

## IMPLEMENTATION CHECKLIST

### HIGH PRIORITY (Do First) 🔴
- [ ] Fix all button heights to h-7 (AdminPage: 4 instances, DataQualityPage: 1 instance)
- [ ] Fix FieldOpsPage micro-action buttons to h-6 minimum
- [ ] Fix TabsList heights to h-7 (FieldOpsPage, OverviewPage)
- [ ] Remove redundant h-7 from individual TabsTrigger elements

### MEDIUM PRIORITY (Do Second) 🟡
- [ ] Fix FieldOpsPage badge to h-4 with px-1.5
- [ ] Standardize all chart tick font sizes to 10 (OverviewPage: 9 instances)
- [ ] Standardize all chart tick font sizes to 10 (AnalyticsPage: 11 instances)
- [ ] Fix remaining info box padding in AnalyticsPage (13 instances)

### LOW PRIORITY (Polish) 🟢
- [ ] Audit and fix border radius inconsistencies
- [ ] Verify all rounded-lg → rounded-md
- [ ] Verify all rounded → rounded-md (except special cases)

---

## VERIFICATION STEPS

After implementing fixes, verify:

1. **Visual Consistency**
   - [ ] All buttons same height (h-7) across all pages
   - [ ] All badges same height (h-4) across all pages
   - [ ] All TabsList same height (h-7)
   - [ ] All info boxes same padding (p-3)

2. **Chart Consistency**
   - [ ] All X-axis ticks fontSize: 10
   - [ ] All Y-axis ticks fontSize: 10 (or 9 for tight horizontal charts)
   - [ ] All tooltips fontSize: 11
   - [ ] All legends fontSize: 10

3. **Border Radius**
   - [ ] All cards use rounded-md
   - [ ] All buttons use rounded-md
   - [ ] All inputs use rounded-md

---

## SPECIFIC COMMANDS TO RUN

### Fix AdminPage Buttons
```bash
# Line 33, 40, 65, 72
Find: className="h-6 text-xs px-2"
Replace: className="h-7 text-xs px-2"
```

### Fix DataQualityPage Button
```bash
# Line 145
Find: className="h-6 text-xs px-2"
Replace: className="h-7 text-xs px-2"
```

### Fix FieldOpsPage TabsList
```bash
# Line 108
Find: className="bg-[#F9FAFB] border border-[#D4DBDE] h-8"
Replace: className="bg-[#F9FAFB] border border-[#D4DBDE] h-7"

# Lines 109-112 (remove h-7 from each)
Find: className="text-xs px-3 h-7"
Replace: className="text-xs px-3"
```

### Fix FieldOpsPage Micro-buttons
```bash
# Lines 177, 181
Find: className="h-5 text-[10px]
Replace: className="h-6 text-[10px]
```

### Fix FieldOpsPage Badge
```bash
# Line 157
Find: className="text-[10px] h-3.5 px-1 border-[#D4DBDE] ml-1.5"
Replace: className="text-[10px] h-4 px-1.5 border-[#D4DBDE] ml-1.5"
```

### Fix OverviewPage BMI TabsList
```bash
# Line 514
Find: className="grid w-full grid-cols-2 h-6 p-[2px]"
Replace: className="grid w-full grid-cols-2 h-7 p-[2px]"
```

### Fix Chart Font Sizes (Batch Replace)
```bash
# In both OverviewPage.tsx and AnalyticsPage.tsx
Find: tick={{ fontSize: 8 }}
Replace: tick={{ fontSize: 10 }}

Find: tick={{ fontSize: 9 }}
Replace: tick={{ fontSize: 10 }}
```

### Fix AnalyticsPage Info Box Padding
```bash
# Find all instances
Find: className="mt-3 p-2 bg-[#
Replace: className="mt-3 p-3 bg-[#
```

### Fix AnalyticsPage Occupation Card Padding
```bash
# Lines 108, 496
Find: className="p-2 bg-[#F9FAFB] rounded-md
Replace: className="p-3 bg-[#F9FAFB] rounded-md
```

---

## ESTIMATED TIME

- **High Priority Fixes:** 30 minutes
- **Medium Priority Fixes:** 45 minutes
- **Low Priority Fixes:** 30 minutes
- **Testing & Verification:** 15 minutes

**Total:** ~2 hours

---

## SUCCESS CRITERIA

✅ **Design Score: 5.0/5.0**

1. All buttons exactly h-7 (28px) - no exceptions except micro-actions (h-6 min)
2. All badges exactly h-4 (16px) with px-1.5
3. All TabsList exactly h-7
4. All card padding exactly p-3
5. All info boxes exactly p-3
6. All chart ticks fontSize: 10 (or 9 for special cases)
7. All tooltips fontSize: 11
8. Border radius standardized to rounded-md
9. No visual inconsistencies visible when reviewing all pages side-by-side
10. Perfect 70% density maintained

---

## NOTES

- MapView layer toggle buttons (h-5) were intentionally made compact in recent updates
  - Consider increasing to h-6 for better accessibility
  - Current h-5 may be acceptable given context (map controls)
  
- Some chart Y-axis labels use fontSize: 8-9 due to long occupation names
  - This is acceptable if needed for layout
  - Prioritize X-axis consistency at fontSize: 10

- Generic Tailwind colors (blue-600, teal-600, green-600) still present in DataQualityPage
  - Not critical but should eventually map to design system colors
  - Create color constant mappings for future updates
