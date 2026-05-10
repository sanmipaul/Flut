/**
 * Storage Utilities Documentation
 *
 * Provides persistent state management for React applications with
 * dual-persistence support (localStorage + sessionStorage) and SSR safety.
 *
 * ## Features
 * - Dual-persistence: Saves to both localStorage and sessionStorage
 * - SSR-safe: Gracefully handles server-side rendering
 * - Error handling: Catches and reports storage errors
 * - Type-safe: Full TypeScript support with generics
 *
 * ## Usage Examples
 *
 * ### Basic Persistence
 * ```typescript
 * import { saveToStorage, loadFromStorage } from './utils/storage';
 *
 * // Save data
 * saveToStorage('user-preferences', { theme: 'dark', lang: 'en' });
 *
 * // Load data
 * const prefs = loadFromStorage<{theme: string, lang: string}>('user-preferences');
 * ```
 *
 * ### Dual Persistence (Recommended)
 * ```typescript
 * import { saveDualStorage, loadDualStorage } from './utils/storage';
 *
 * // Save to both localStorage and sessionStorage
 * saveDualStorage('filter-state', { status: 'active', page: 1 });
 *
 * // Load from localStorage with sessionStorage fallback
 * const state = loadDualStorage('filter-state');
 * ```
 *
 * ### Clearing Data
 * ```typescript
 * import { clearDualStorage } from './utils/storage';
 *
 * // Remove from both storages
 * clearDualStorage('filter-state');
 * ```
 *
 * ## Storage Types
 *
 * ### localStorage
 * - Persistent across browser sessions
 * - Survives browser restarts
 * - Manual clearing required
 * - Use for: Long-term preferences, saved filters, user settings
 *
 * ### sessionStorage
 * - Cleared when browser/tab closes
 * - Useful for temporary session data
 * - Private browsing fallback
 * - Use for: Session-specific state, temporary filters
 *
 * ## SSR Considerations
 *
 * All functions are SSR-safe and should be called within:
 * - useEffect hooks
 * - Event handlers
 * - Component mount lifecycle methods
 *
 * Do NOT call during render on the server side.
 *
 * ## Error Handling
 *
 * All functions include try-catch blocks and will:
 * - Return null on load failures
 * - Return false on save/remove failures
 * - Log warnings to console in development
 *
 * ## Testing
 *
 * Mock localStorage/sessionStorage in tests:
 * ```typescript
 * Object.defineProperty(window, 'localStorage', {
 *   value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() }
 * });
 * ```
 */
