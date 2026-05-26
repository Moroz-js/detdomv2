/** Маска: +7 (XXX) XXX-XX-XX */
export const RU_PHONE_PLACEHOLDER = '+7 (___) ___-__-__'

const MAX_DIGITS = 11

function normalizeDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  else if (!digits.startsWith('7')) digits = '7' + digits

  return digits.slice(0, MAX_DIGITS)
}

export function formatRuPhoneMask(value: string): string {
  const digits = normalizeDigits(value)
  if (!digits) return ''

  const rest = digits.slice(1)
  let out = '+7'

  if (rest.length === 0) return out

  out += ' ('
  out += rest.slice(0, 3)

  if (rest.length < 3) return out

  out += ') '
  out += rest.slice(3, 6)

  if (rest.length < 6) return out

  out += '-'
  out += rest.slice(6, 8)

  if (rest.length < 8) return out

  out += '-'
  out += rest.slice(8, 10)

  return out
}

/** true, если введён полный номер (11 цифр с кодом страны) */
export function isRuPhoneComplete(masked: string): boolean {
  const digits = masked.replace(/\D/g, '')
  return digits.length === MAX_DIGITS
}
