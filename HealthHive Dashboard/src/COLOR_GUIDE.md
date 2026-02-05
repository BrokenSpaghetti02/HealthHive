# Color Consistency Guide for Jagna Health Data Management System

## Color Scheme Rules

### HTN (Hypertension) - Orange Shades
- Primary: `#CD5E31`
- Dark: `#B14F22`
- Light: `#E6B99B`
- Background: `#FFF4ED`

### DM (Diabetes Mellitus) - Blue Shades
- Primary: `#274492`
- Accent: `#3F5FF1`
- Medium: `#4D6186`
- Light: `#92A4C1`
- Background: `#EAF0F6`

### General/System/Purple Shades (for non-HTN/DM elements)
- Primary: `#7C3AED`
- Dark: `#6D28D9`
- Light: `#A78BFA`
- Ultra Light: `#C4B5FD`
- Background: `#F3F0FF`

### Neutral Colors
- Background: `#F9FAFB`
- Border: `#D4DBDE`
- Text Dark: `#1E1E1E`
- Text Medium: `#4D6186`

## Application Rules

1. **HTN-related cards, charts, badges**: Use orange shades
2. **DM-related cards, charts, badges**: Use blue shades
3. **General operations (field ops, scheduling, reminders, data quality)**: Use purple shades
4. **Trend indicators**: 
   - Positive trends for HTN/DM: Use respective disease color
   - Negative trends: Use warning orange (#CD5E31 or #B14F22)
   - General positive trends: Use purple (#7C3AED)
5. **Section headers**: Use corresponding color (#CD5E31 for HTN, #274492 for DM, #7C3AED for general)

## Files Updated
- ✅ FieldOpsPage.tsx
- ✅ ResourcesPage.tsx (partially)
- ✅ KPICard.tsx
- ✅ HeatMapView.tsx
- ✅ OverviewPage.tsx (partially)
- ⏳ AnalyticsPage.tsx (in progress)
- ⏳ RegistryPage.tsx
- ⏳ DataQualityPage.tsx
