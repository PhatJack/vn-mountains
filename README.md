# VN Mountains

An interactive map of mountains and peaks across Vietnam, built with Next.js, MapLibre GL, and OpenStreetMap data.

## Features

- Interactive map with clustering and custom markers
- Real-time data from the Overpass API (OpenStreetMap)
- Search and filter peaks by name, elevation, and region
- Responsive sidebar with detailed peak information
- Dark/light theme support

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Map:** [MapLibre GL](https://maplibre.org/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Data:** [Overpass API](https://overpass-api.de/) (OpenStreetMap)
- **State:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) package manager

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Create production build  |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## Project Structure

```
vn-mountains/
├── app/
│   ├── page.tsx            # Main page component
│   └── layout.tsx          # Root layout
├── components/
│   ├── VietNamMap.tsx      # MapLibre GL map component
│   ├── MountainSidebar.tsx # Search/filter sidebar
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── overpass.ts         # Overpass API queries & GeoJSON
│   └── utils.ts            # Utility functions
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
