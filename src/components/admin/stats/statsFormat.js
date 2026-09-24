import { formatter } from '@/scripts/global'

// Number formats for the Stats page (South African style, like the rest of the site: R 1 234,50)
const whole = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 })
const roundRand = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

const compact = new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 })

export const money = (value) => formatter.format(value || 0)
// Rand without cents, for labels on the charts
export const moneyRound = (value) => roundRand.format(value || 0)
export const count = (value) => whole.format(value || 0)
// Short forms for tight spaces (small screens): 22,8K and R 22,8K
export const countShort = (value) => compact.format(value || 0)
export const moneyShort = (value) => `R ${compact.format(value || 0)}`
export const percent = (part, total) => (total ? `${Math.round((part / total) * 100)}%` : '0%')

// The measures the charts and the category table can show
export const MEASURES = [
  { key: 'value', label: 'Stock value', format: moneyRound, short: moneyShort },
  { key: 'products', label: 'Products', format: count, short: countShort },
  { key: 'units', label: 'Units in stock', format: count, short: countShort },
]

// "R50 – R99" style labels for the price bands the server sends ({ min, max } with max null for the last)
export const priceBandLabel = (band) =>
  band.max === null ? `R${count(band.min)}+` : `R${count(band.min)} – R${count(band.max - 1)}`

export const stockLevelLabel = (level) => {
  if (level.max === 0) return 'Out of stock'
  if (level.max === null) return `${count(level.min)}+ units`
  if (level.min === level.max) return `${count(level.min)} unit${level.min === 1 ? '' : 's'}`
  return `${count(level.min)} – ${count(level.max)} units`
}

// Link to a product's category in the product editor. `category` is its path ("Toys › Cars").
export const editLink = (categoryID, category = '') => ({
  name: 'edit-products',
  params: { categoryID, categoryName: category.split(' › ').at(-1) || undefined },
})
