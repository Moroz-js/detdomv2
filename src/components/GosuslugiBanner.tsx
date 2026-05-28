import Link from 'next/link'

const GOSUSLUGI_BG_URL = 'https://pos.gosuslugi.ru/bin/banner-fluid/5/banner-fluid-bg-5-2.svg'
const GOSUSLUGI_LOGO_URL = 'https://pos.gosuslugi.ru/bin/banner-fluid/gosuslugi-logo-blue.svg'

type GosuslugiBannerProps = {
  text: string
  buttonLabel: string
  buttonUrl: string
}

export function GosuslugiBanner({ text, buttonLabel, buttonUrl }: GosuslugiBannerProps) {
  return (
    <section className="overflow-hidden rounded-none border border-stone-200 bg-white shadow-[0_2px_16px_-4px_rgba(28,25,23,0.08)]">
      <div className="grid min-h-[150px] grid-cols-1 md:min-h-[132px] md:grid-cols-[1fr_46%]">
        <div className="flex flex-col justify-center bg-[#50B3FF] px-5 py-5 md:px-10 md:py-4">
          <div className="max-w-[520px] space-y-3">
            <p className="text-[20px] font-semibold leading-tight text-[#0B1F33] md:text-[18px]">{text}</p>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-4 text-xs font-medium text-stone-900 shadow-sm transition-colors hover:bg-stone-100"
              href={buttonUrl}
            >
              {buttonLabel}
            </Link>
          </div>
        </div>
        <div
          className="relative min-h-[150px] bg-[#FFFaf6] bg-no-repeat md:min-h-[132px]"
          style={{
            backgroundImage: `url("${GOSUSLUGI_BG_URL}")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
          }}
        >
          <div className="absolute right-3 top-2 flex flex-col items-start md:right-4 md:top-3">
            <img
              alt="Госуслуги"
              className="h-auto w-[58px] md:w-[64px]"
              src={GOSUSLUGI_LOGO_URL}
            />
            <span className="text-[10px] font-semibold leading-none text-[#005CA9] md:text-[11px]">
              Решаем вместе
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function isGosuslugiCta(buttonUrl: unknown): boolean {
  return typeof buttonUrl === 'string' && buttonUrl.includes('pos.gosuslugi.ru')
}
