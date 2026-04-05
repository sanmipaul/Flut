/**
 * Visually hidden link that becomes visible on focus.
 * Allows keyboard users to skip repetitive navigation.
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      aria-label="Skip to main content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-xl focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
