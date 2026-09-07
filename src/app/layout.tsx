import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aptivo Connect | Meetup. Build. Experience.',
  description:
    'Aptivo Connect helps students access the people, projects, experiences, and opportunities they normally would not easily reach.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
