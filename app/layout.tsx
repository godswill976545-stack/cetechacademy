import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import StyledJsxRegistry from '@/lib/registry';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CeTech Academy',
  description: 'Elite Digital Craftsmanship & Tech Education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <ConvexClientProvider>
          <StyledJsxRegistry>
            {children}
          </StyledJsxRegistry>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
