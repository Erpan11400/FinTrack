import { InvariantError } from '../exceptions/index.js';

/**
 * Evaluates simple arithmetic expression (+ - * / parentheses) using a
 * recursive-descent parser (without eval/Function).
 * @param {string|number} exprStr
 * @returns {number}
 */
export const evaluateMathExpression = (exprStr) => {
  if (exprStr === undefined || exprStr === null || String(exprStr).trim() === '') {
    throw new InvariantError('Ekspresi nominal (raw_expression) wajib diisi');
  }

  const clean = String(exprStr).replace(/\s+/g, '');

  if (/[^0-9+\-*/().]/.test(clean)) {
    throw new InvariantError(
      'raw_expression hanya boleh berisi angka dan operator matematika (+, -, *, /, ())'
    );
  }

  let open = 0;
  for (const ch of clean) {
    if (ch === '(') open++;
    if (ch === ')') open--;
    if (open < 0) {
      throw new InvariantError('Format tanda kurung buka/tutup pada raw_expression salah');
    }
  }
  if (open !== 0) {
    throw new InvariantError('Tanda kurung pada raw_expression belum ditutup');
  }

  if (/[+\-*/]{2,}/.test(clean)) {
    throw new InvariantError('Operator matematika berurutan tidak valid pada raw_expression');
  }
  if (/^[*/]/.test(clean) || /[+\-*/]$/.test(clean)) {
    throw new InvariantError('Ekspresi matematika raw_expression tidak lengkap');
  }

  let pos = 0;
  const peek = () => clean[pos];

  const parseExpr = () => {
    let v = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = clean[pos++];
      const r = parseTerm();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };

  const parseTerm = () => {
    let v = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = clean[pos++];
      const r = parseFactor();
      if (op === '/' && r === 0) {
        throw new InvariantError('Pembagian dengan nol tidak diperbolehkan');
      }
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };

  const parseFactor = () => {
    if (peek() === '-') {
      pos++;
      return -parseFactor();
    }
    if (peek() === '+') {
      pos++;
      return parseFactor();
    }
    if (peek() === '(') {
      pos++;
      const v = parseExpr();
      if (peek() !== ')') throw new Error('paren');
      pos++;
      return v;
    }
    const start = pos;
    while (pos < clean.length && /[0-9.]/.test(clean[pos])) pos++;
    if (start === pos) throw new Error('num');
    const n = Number(clean.slice(start, pos));
    if (Number.isNaN(n)) throw new Error('num');
    return n;
  };

  try {
    const result = parseExpr();
    if (pos !== clean.length) throw new Error('trailing');
    if (!Number.isFinite(result)) {
      throw new InvariantError('Hasil kalkulasi raw_expression bukan angka valid');
    }
    const rounded = Math.round(result);
    if (rounded <= 0) {
      throw new InvariantError('Hasil nominal amount harus lebih besar dari 0');
    }
    return rounded;
  } catch (err) {
    if (err instanceof InvariantError) throw err;
    throw new InvariantError('Sintaks raw_expression tidak valid');
  }
};

export default evaluateMathExpression;

