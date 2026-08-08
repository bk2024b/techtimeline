import "./globals.css";

export const metadata = {
  title: "TechTimeline",
  description: "Explore the evolution of technology.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
