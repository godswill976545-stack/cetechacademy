import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Roboto_Flex } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
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

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-roboto-flex',
  display: 'swap',
  axes: ['opsz', 'wght'] as any,
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${robotoFlex.variable}`}>
      <body className="antialiased">
        <ClerkProvider>
          <StyledJsxRegistry>
            {children}
          </StyledJsxRegistry>
        </ClerkProvider>
      </body>
    </html>
  );
}
