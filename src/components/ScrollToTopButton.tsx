'use client'

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      className="fixed bottom-[20px] right-[20px] z-[110] inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white shadow-md transition-colors hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      aria-label="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M6 15 12 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
