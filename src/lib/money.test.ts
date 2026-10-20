import { describe, expect, it } from 'vitest'
import { money, moneyInput, parseMoney } from './money'

describe('exact kopeck amounts', () => {
  it.each([
    ['150', 15000],
    ['0,01', 1],
    ['12.30', 1230],
    ['1000000', 100000000],
    ['999.99', 99999],
  ])('parses %s exactly', (input, result) => expect(parseMoney(input)).toBe(result))
  it.each([
    '',
    '-1',
    'NaN',
    '1e3',
    '0',
    '0,001',
    '1000001',
    'Infinity',
    '12.345',
    '2,2,2',
    '1 000',
    '.5',
  ])('rejects invalid amount %s', (input) => expect(parseMoney(input)).toBeNull())
  it('round trips every kopeck, without floating point arithmetic', () => {
    for (let i = 1; i < 100000; i += 37) expect(parseMoney(moneyInput(i))).toBe(i)
  })
  it('formats rubles with no unnecessary kopecks', () => {
    expect(money(15000).replace(/\s/g, '')).toBe('150₽')
    expect(money(15001).replace(/\s/g, '')).toBe('150,01₽')
  })
})
