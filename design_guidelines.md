# Bitcoin Information Platform - Design Guidelines

## Design Approach
**System**: Custom data-centric design inspired by TradingView and Bloomberg Terminal
**Rationale**: Financial dashboards require specialized data visualization patterns, clear information hierarchy, and professional credibility over pure aesthetics.

## Core Design Elements

### Typography
- **Primary Font**: Inter (via Google Fonts CDN) - exceptional readability for data
- **Display/Headers**: 32px, 24px, 20px (font-weight: 600-700)
- **Body Text**: 16px, 14px (font-weight: 400-500)
- **Data/Numbers**: 18px, 14px, 12px (font-weight: 500-600, tabular-nums for alignment)
- **Labels/Metadata**: 12px, 11px (font-weight: 400, text-gray-400)

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Card padding: p-6
- Section spacing: gap-6 or gap-8
- Tight data grids: gap-4
- Page margins: px-6 md:px-8

### Component Library

**Dashboard Cards**
- Elevated panels with subtle borders (border-white/5)
- Rounded corners (rounded-xl)
- Internal padding p-6
- Header with title + metadata row
- Content area with clear data hierarchy

**Data Metrics Display**
- Large numerical values (24px-32px)
- Percentage changes with color-coded indicators
- Small trend sparklines (inline, 40px height)
- Label below or beside numbers

**Charts Container**
- Full-width within cards
- Height: 300px-400px for primary charts, 150px-200px for auxiliary
- Use Chart.js or similar library (loaded via CDN)
- Grid lines in subtle white/10

**Navigation**
- Persistent sidebar (280px width, desktop)
- Icons + labels (Heroicons via CDN)
- Active state: subtle highlight background
- Collapsible on mobile

**Tables**
- Zebra striping (subtle bg-white/2 on alternates)
- Fixed header on scroll
- Right-align numerical columns
- Sortable headers with icons

**Alert Indicators**
- Anomaly detection badges (rounded-full, px-3, py-1)
- Small dot indicators for status
- Toast notifications (top-right, slide-in)

### Images

**Hero Section**: 
Yes - use abstract Bitcoin/blockchain visualization imagery
- Full-width hero (h-96 on desktop, h-64 mobile)
- Image: Dark, high-tech abstract representation of Bitcoin network nodes/connections with glowing orange accents
- Overlay gradient (from-black/60 to-transparent)
- CTA buttons with backdrop-blur-md bg-white/10

**Dashboard Graphics**:
- Small Bitcoin logo (32px) in top navigation
- Icon illustrations for empty states (256px, centered)

### Layout Structure

**Homepage/Dashboard**:
1. Hero with platform title, real-time BTC price ticker, primary CTAs
2. Overview metrics (4-column grid: Price, Market Cap, 24h Volume, Dominance)
3. Primary chart section (full-width price chart)
4. 2-column grid: Market indicators (left) + Recent activity feed (right)

**Liquidity Dashboard** (New Feature):
1. Header: Title + time range selector + refresh indicator
2. FRED Indicators Grid (3-column on desktop, stack mobile):
   - Each card shows: Indicator name, current value, YoY %, trend chart
3. Anomaly Detection Section:
   - Table of flagged indicators with severity badges
   - Timestamp + deviation percentage
4. Comparative Analysis (2-column): 
   - Multi-line chart comparing selected indicators
   - Controls for indicator selection

### Visual Hierarchy Patterns
- **Priority 1** (Largest): Current BTC price, critical alerts
- **Priority 2**: Chart visualizations, YoY percentages
- **Priority 3**: Supporting metrics, labels
- **Priority 4**: Metadata, timestamps

### Interaction Patterns
- Hover states on cards: subtle border glow (border-blue-500/20)
- Chart tooltips: dark bg-gray-900 with border
- Loading states: skeleton screens (animate-pulse)
- Real-time updates: pulse animation on changed values

### Responsive Strategy
- Desktop (lg): Multi-column dashboards, sidebar visible
- Tablet (md): 2-column max, sidebar collapses to hamburger
- Mobile: Single column stack, sticky bottom navigation

**Key Principle**: Clarity over decoration - every element serves data comprehension. Dense information architecture with breathing room through strategic whitespace, not empty sections.