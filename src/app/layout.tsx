import type { Metadata } from 'next';
import { DM_Serif_Display, Manrope } from 'next/font/google';
import './globals.css';

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const manrope = Manrope({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aptivo Connect | Meet. Build. Experience.',
  description:
    'Aptivo Connect helps students access the people, projects, experiences, and opportunities they normally would not easily reach.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${manrope.variable} h-full`}>
      <body className="min-h-screen flex flex-col font-sans antialiased text-[#18201C] bg-[#F7F6F1]">
        {children}
      </body>
    </html>
  );
}

