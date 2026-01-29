# Sport League Organizer

A modern web application for organizing and managing sports leagues, players, seasons, and match results. Built with React, TypeScript, and Supabase.

## Features

- **League Management** - Create and manage multiple leagues with custom settings
- **Season Management** - Organize seasons within leagues with start/end dates
- **Player Management** - Add, edit, and manage player information and rankings
- **Round Management** - Create rounds and organize bracket/round-robin matches
- **Match Scoring** - Record match results and automatically update player rankings
- **Match Notes** - Add optional text notes to matches for context and commentary
- **Event Tracking** - Log league events and maintain history
- **Round History** - View, edit, and undo round results with full snapshot support
- **Authentication** - Secure user authentication with CSRF protection
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest with Testing Library
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account and project

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd league-master
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing

Run all tests:

```bash
npm run test
```

Run tests in UI mode:

```bash
npm run test:ui
```

Generate coverage report:

```bash
npm run test:coverage
```

View the detailed HTML coverage report in `coverage/index.html`. See [COVERAGE.md](COVERAGE.md) for analysis and improvement roadmap.

### Building

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Project Structure

```bash
src/
├── components/          # React components
│   ├── forms/          # Form components
│   ├── shared/         # Shared/reusable components
│   ├── tabs/           # Tab content components
│   └── error/          # Error handling components
├── features/           # Feature-specific modules
│   ├── events/         # Event management
│   ├── leagues/        # League management
│   ├── players/        # Player management
│   └── rounds/         # Round management
├── stores/             # Zustand state stores
├── hooks/              # Custom React hooks
├── services/           # API/Supabase services
├── utils/              # Utility functions
├── contexts/           # React contexts
├── __tests__/          # Integration tests
├── test/               # Test utilities and setup
└── types.ts            # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Key Features Details

### League Management

- Create and configure leagues with custom rules
- Support for multiple seasons per league
- League-specific player rankings and statistics

### Player Management

- Add players with rank assignments
- Track player statistics and performance
- Support for player imports

### Round Management

- Create bracket tournaments or round-robin matches
- Automatic bracket generation from player list
- Support for different player counts (3-player, 4-player, etc.)

### Match Scoring

- Record match scores and results
- Automatic ranking updates based on outcomes
- Match history and statistics
- Optional text notes on each match for context (e.g., injury, forfeit, disputed)

### Round History Management

- View complete history of all rounds
- Edit match results in the last round (with automatic recomputation of standings)
- One-level undo to revert round edits
- Notes persist through edits and undo operations

### Authentication & Security

- User authentication via Supabase
- CSRF token protection
- Row-level security (RLS) in database

## Test Suite

The project includes comprehensive integration and unit tests:

- **Unit Tests**: Service functions, utilities, and hooks
- **Integration Tests**: Feature workflows (league management, player management, events)
- **Component Tests**: UI component rendering and interactions

Run specific test file:

```bash
npm run test -- src/path/to/test.ts
```

## Deployment

The app is configured for deployment on Vercel. Push to main branch to trigger automatic deployment.

## Security

- CSRF tokens are validated on all state-modifying operations
- Supabase RLS ensures data isolation per user
- All API requests are authenticated
- Environment variables for sensitive data

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test: `npm run test`
3. Build to verify: `npm run build`
4. Push and create a pull request

## Troubleshooting

### Tests failing

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear vitest cache: `npm run test -- --clearCache`

### Build errors

- Check TypeScript errors: `npx tsc --noEmit`
- Ensure all environment variables are set

### Connection issues

- Verify Supabase credentials in `.env.local`
- Check Supabase project is active and accessible

## License

See LICENSE file for details.

## Support

For issues or questions, please open a GitHub issue.
