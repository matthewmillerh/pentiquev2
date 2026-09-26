// Whether a product is a car: it sits in (or somewhere beneath) a category whose name mentions cars or Hot Wheels,
// e.g. "Diecast Cars", "Toys › Cars", "Majorette - Street Cars", "Hot Wheels - Silver Series".
// Products are not tagged, and categories get moved around, so the category names are what counts.
const CAR_CATEGORY = /\b(cars?|hot\s*wheels)\b/i

// `product.categoryPath` is the chain of categories from the top level down, as /products/:id returns it
export const isCarProduct = (product) =>
  Array.isArray(product?.categoryPath) &&
  product.categoryPath.some((step) => CAR_CATEGORY.test(step.name))
