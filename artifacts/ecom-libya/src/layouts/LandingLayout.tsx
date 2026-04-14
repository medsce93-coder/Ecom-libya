/**
 * LandingLayout — blank canvas with NO Navbar or Footer.
 * Used exclusively for ad-campaign landing pages (/offer/:id).
 * The global CSS (fonts, RTL, Tailwind) still applies via main.tsx.
 */
export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
