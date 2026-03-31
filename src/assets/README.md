# Assets

Central place for static assets and shared icon components.

## Folder structure

```
src/assets/
├── README.md           # This file
└── icons/              # SVG icon components (React)
    ├── index.ts        # Barrel: import from "@/assets/icons"
    ├── shared/         # Trend, filter, arrows, return-exchange
    ├── layout/         # Sidebar & nav (dashboard, user, CMS, banner, reels, blog, contributors, profile)
    ├── dashboard/      # KPI and modal icons (active users, bounce rate, reorder, current/previous week)
    ├── order-management/  # Custom orders KPI icons
    └── cms/            # CMS overview KPI (active banners, pending reels, published blogs, contributors)
```

## Usage

Import icons from the barrel:

```ts
import {
  DashboardIcon,
  FilterIcon,
  ActiveUsersIcon,
  LineChartIcon,
  ActiveBannersIcon,
  CmsContributorsIcon,
} from "@/assets/icons"
```

- **Layout icons**: Sidebar and navigation.
- **Shared**: `TrendUpIcon`, `TrendDownIcon`, `FilterIcon`, `ArrowExternalIcon`, `ReturnExchangeIcon`.
- **Dashboard**: Main dashboard KPIs and analytics modal KPIs.
- **Order management**: Custom orders page KPIs.
- **CMS**: Overview KPIs; contributors icon is exported as `CmsContributorsIcon` to avoid clashing with layout `ContributorsIcon`.

Chart-related icons (`LineChartIcon`, `PieChartIcon`, `BarChartIcon`, `SalesTrendsTitleIcon`, `CHART_TYPE_OPTIONS`) live in `icons/chart.tsx` and are exported from `@/assets/icons`.
