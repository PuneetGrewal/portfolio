import './global.css'
import type { Metadata, Viewport } from 'next'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from '@/components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from '@/components/footer'
import { MatrixController } from '@/components/matrix/controller'
import { ThemeProvider } from '@/components/theme-provider'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Puneet Grewal',
    template: '%s | Puneet Grewal',
  },
  description: 'Website for Puneet Grewal',
  openGraph: {
    title: 'Puneet Portfolio',
    description: 'Website for Puneet Grewal',
    url: baseUrl,
    siteName: 'Puneet Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#030806',
  colorScheme: 'dark',
}

// Runs before the first paint, ahead of React. On the first load of a visit it
// holds a blank screen until the intro takes over; on later loads it keeps the
// page content hidden until the quick decode starts. The matching CSS is in
// global.css. Visitors who ask for reduced motion get neither, and both holds
// lift after 4s whatever happens, so a script error can never leave a blank
// page.
const boot = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var s;try{s=sessionStorage.getItem('mx-intro')}catch(e){s='1'}d.setAttribute('data-mx-wait',s?'page':'intro');setTimeout(function(){d.removeAttribute('data-mx-wait')},4000)}catch(e){}})()`

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // suppressHydrationWarning: before React hydrates, the boot script sets
  // data-mx-wait on <html> and next-themes sets the theme class and
  // color-scheme, so it differs from the server HTML on purpose.
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cx(
        'bg-background text-foreground', // Using the colors defined in your global.css
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        {/* Dark unless the visitor has picked light with the toggle. The OS
            setting is left out on purpose: the matrix look is dark first. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {/* The part that changes from page to page. Later pages decode
                only this, not the nav or footer. */}
            <div data-mx-page>{children}</div>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </main>
          <MatrixController />
        </ThemeProvider>
      </body>
    </html>
  )
}
