import { type Metadata } from 'next'
import glob from 'fast-glob'

import { Providers } from '@/app/[locale]/providers'
import { Layout } from '@/components/Layout'
import { dir } from 'i18next'
import i18nConfig from '../../../i18n.config'
import { type Section } from '@/components/SectionProvider'

import '@/styles/tailwind.css'
import TranslationsRoot from '@/components/TranslationsRoot'

export const metadata: Metadata = {
  title: {
    template: '%s - Protocol API Reference',
    default: 'Protocol API Reference',
  },
}

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let pages = await glob('**/*.mdx', { cwd: 'src/app/[locale]' })
  let allSectionsEntries = (await Promise.all(
    pages.map(async (filename) => [
      '/' + filename.replace(/(^|\/)page\.mdx$/, ''),
      (await import(`./${filename}`)).sections,
    ]),
  )) as Array<[string, Array<Section>]>
  let allSections = Object.fromEntries(allSectionsEntries)

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className="h-full"
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <TranslationsRoot locale={locale}>
          <Providers>
            <div className="w-full">
              <Layout allSections={allSections}>{children}</Layout>
            </div>
          </Providers>
        </TranslationsRoot>
      </body>
    </html>
  )
}
