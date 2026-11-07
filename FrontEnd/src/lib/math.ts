export interface MathResult {
  valid: boolean
  value: number
  error: string | null
}

/**
 * Evaluates a simple arithmetic expression (+ - * / parentheses) using a
 * small recursive-descent parser (no eval / Function).
 */
export function evaluateMathExpression(exprStr: string): MathResult {
  if (!exprStr || exprStr.trim() === '') {
    return { valid: false, value: 0, error: 'Input nominal masih kosong' }
  }
  const clean = exprStr.replace(/\s+/g, '')

  if (/[^0-9+\-*/().]/.test(clean)) {
    return { valid: false, value: 0, error: 'Karakter tidak valid! Hanya angka & operator matematika' }
  }

  let open = 0
  for (const ch of clean) {
    if (ch === '(') open++
    if (ch === ')') open--
    if (open < 0) return { valid: false, value: 0, error: 'Format tanda kurung buka/tutup salah' }
  }
  if (open !== 0) return { valid: false, value: 0, error: 'Tanda kurung belum ditutup' }

  if (/[+\-*/]{2,}/.test(clean)) {
    return { valid: false, value: 0, error: 'Operator matematika berurutan tidak valid' }
  }
  if (/^[*/]/.test(clean) || /[+\-*/]$/.test(clean)) {
    return { valid: false, value: 0, error: 'Ekspresi matematika tidak lengkap' }
  }

  let pos = 0
  const peek = () => clean[pos]

  function parseExpr(): number {
    let v = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = clean[pos++]
      const r = parseTerm()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  function parseTerm(): number {
    let v = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const op = clean[pos++]
      const r = parseFactor()
      v = op === '*' ? v * r : v / r
    }
    return v
  }
  function parseFactor(): number {
    if (peek() === '-') {
      pos++
      return -parseFactor()
    }
    if (peek() === '+') {
      pos++
      return parseFactor()
    }
    if (peek() === '(') {
      pos++
      const v = parseExpr()
      if (peek() !== ')') throw new Error('paren')
      pos++
      return v
    }
    const start = pos
    while (pos < clean.length && /[0-9.]/.test(clean[pos])) pos++
    if (start === pos) throw new Error('num')
    const n = Number(clean.slice(start, pos))
    if (Number.isNaN(n)) throw new Error('num')
    return n
  }

  try {
    const result = parseExpr()
    if (pos !== clean.length) throw new Error('trailing')
    if (!Number.isFinite(result)) {
      return { valid: false, value: 0, error: 'Hasil kalkulasi bukan angka valid' }
    }
    return { valid: true, value: Math.round(result), error: null }
  } catch {
    return { valid: false, value: 0, error: 'Sintaks ekspresi matematika salah' }
  }
}

