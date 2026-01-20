# Test Coverage Report

**Generated:** January 19, 2026  
**Test Files:** 11 passed  
**Total Tests:** 107 passed  
**Overall Coverage:** 21.38% lines

## Coverage Baseline

| Metric     | Current | Target | Gap     |
| ---------- | ------- | ------ | ------- |
| Lines      | 21.38%  | 50%    | -28.62% |
| Functions  | 21.68%  | 50%    | -28.32% |
| Branches   | 10.81%  | 40%    | -29.19% |
| Statements | 20.53%  | 50%    | -29.47% |

## Well-Tested Areas (>80%)

### Stores (100%)

- ✅ `leagueStore.ts` - 100% coverage
- ✅ `authStore.ts` - 100% coverage
- Comprehensive state management testing

### Selectors & Hooks (100%)

- ✅ `useLeagueSelector.ts` - 100% coverage
- ✅ `useSeasonSelector.ts` - 100% coverage
- Full selector hook coverage

### Shared Components (100%)

- ✅ `TabButton.tsx` - 100% coverage
- ✅ `Toast.tsx` - 100% coverage
- Core UI components well tested

### Services (75%+)

- ✅ `leagueService.ts` - 93.1% lines (only 2 branches uncovered)
- ✅ `leagueService tests` - 100% coverage

## Moderate Coverage (40-80%)

### Layout Components (55.81%)

- ⚠️ `Header.tsx` - 63.15% (missing error/edge cases)
- ⚠️ `DesktopNav.tsx` - 100% ✓
- ⚠️ `AuthButton.tsx` - 57.14%
- ⚠️ `MobileMenu.tsx` - 38.46% (mobile edge cases)

### Main App Component (39.71%)

- ⚠️ `App.tsx` - Many conditional branches untested
- Missing edge case scenarios
- Tab switching variations need coverage

### Error Handling (31.57%)

- ⚠️ `ErrorBoundary.tsx` - 29.41% (error states not fully tested)
- ⚠️ `ErrorFallback.tsx` - 50%

### Hooks (58-83%)

- ✅ `useLeagueDataFetch.ts` - 83.33%
- ⚠️ `useNotification.ts` - 77.77%
- ⚠️ `usePlayerData.ts` - 58.33%

## Low Coverage (<40%)

### Player Management (5-12%)

- 🔴 `playerService.ts` - 6.75% (most logic untested)
- 🔴 `PlayerStatsRow.tsx` - 3.03% (rendering never tested)
- 🔴 `PlayerManagementSection.tsx` - 7.69%
- 🔴 `AddPlayerForm.tsx` - 4.76%
- 🔴 `PlayersTab.tsx` - 50% (some paths missing)

### Round Management (8-3%)

- 🔴 `roundService.ts` - 7.57% (bracket logic untested)
- 🔴 `HistoryTab.tsx` - 4%
- 🔴 `RoundHistoryCard.tsx` - 3.03%

### Event Management (12%)

- 🔴 `eventService.ts` - 22.72%
- 🔴 `AddEventForm.tsx` - 6.66%
- 🔴 `EventCard.tsx` - 16.66%
- 🔴 `EventsTab.tsx` - 33.33%

### Authentication (4-28%)

- 🔴 `Auth.tsx` - 4.34% (auth UI not tested)
- ⚠️ `useCsrfHandler.ts` - 50%
- ⚠️ `useCsrfValidation.ts` - 17.64%
- ✅ `csrfToken.ts` - 63.15%

### League Management (2-3%)

- 🔴 `LeagueManager.tsx` - 1.01% (main UI untested)
- 🔴 `LeagueSection.tsx` - 1.51%
- ✅ `LeagueSelector.tsx` - 100% ✓

### Utilities (2-12%)

- 🔴 `leagueUtils.ts` - 2.39% (calculations untested)
- 🔴 `exportUtils.ts` - 2.72%
- ⚠️ `statsUtils.ts` - 11.9%
- ✅ `moveItems.ts` - 28.57%

### Group Management (4%)

- 🔴 `GroupCard.tsx` - 1.88%
- 🔴 `GroupGenerationPanel.tsx` - 20%
- 🔴 `GroupRenderingPanel.tsx` - 12.5%

## Priority Improvement Roadmap

### Phase 1: Critical Services (Highest Impact)

1. **playerService.ts** (6.75% → 80%)

   - Test player CRUD operations
   - Test rank calculations
   - Test import functionality
   - Est. 20 new tests

2. **roundService.ts** (7.57% → 80%)

   - Test bracket generation logic
   - Test round-robin scenarios
   - Test scoring and ranking updates
   - Est. 25 new tests

3. **eventService.ts** (22.72% → 80%)

   - Test event creation/deletion
   - Test event filtering
   - Est. 15 new tests

4. **LeagueManager.tsx** (1.01% → 60%)

   - Test league CRUD UI
   - Test state management integration
   - Est. 12 new tests

5. **PlayersTab.tsx** (50% → 80%)

   - Test standings display
   - Test filtering/sorting
   - Est. 8 new tests

6. **App.tsx** (39.71% → 70%)

   - Test tab switching
   - Test conditional rendering
   - Test error boundaries
   - Est. 15 new tests

7. **leagueUtils.ts** (2.39% → 60%)

   - Test league validation
   - Test season calculations
   - Est. 18 new tests

8. **Hooks** (currently 58-83%)

   - Improve usePlayerData.ts (58% → 80%)
   - Test error scenarios
   - Est. 10 new tests

9. **Auth.tsx** (4.34% → 50%)

   - Test login/logout flows
   - Test auth state
   - Est. 12 new tests

10. **Form Components** (4-7%)
    - Test AddPlayerForm
    - Test AddEventForm
    - Test form validation
    - Est. 15 new tests

## Testing Patterns Needed

### Service Testing

```typescript
// Pattern: Mock database, test business logic
vi.mock("@/utils/supabase");
const mockSupabase = { from: vi.fn(), ... };
// Test CRUD, filtering, calculations
```

### Component Testing

```typescript
// Pattern: Render with mocks, verify UI
import { render, screen, fireEvent } from "@testing-library/react";
// Test rendering, user interactions, state updates
```

### Hook Testing

```typescript
// Pattern: Use @testing-library/react hooks
import { renderHook, act } from "@testing-library/react";
// Test hook logic, state changes
```

## Coverage HTML Report

View detailed line-by-line coverage:

```bash
npm run test:coverage
open coverage/index.html
```

## Coverage Goals

To improve coverage systematically, target these incremental goals:

**Current baseline (21% lines):**

- Phase 1: 30% lines (critical services)
- Phase 2: 40% lines (key components)
- Phase 3: 55% lines (utilities & hooks)
- Phase 4: 70% lines (full coverage goal)

## Maintenance

- Run `npm run test:coverage` before every commit
- Review coverage gaps when adding new features
- Update thresholds incrementally (5% increases)
- Aim for 70%+ coverage by Q2 2026

## Notes

- Many untested components are UI-heavy with complex rendering logic
- Some services have complex business logic (bracket generation, ranking) that needs dedicated tests
- Form components need validation testing
- Error paths (error boundaries, CSRF handling) have low coverage
- Integration tests exist but don't cover all code paths yet
