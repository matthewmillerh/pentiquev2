// Helpers for the nested category tree ({ id, name, productCount, subcategories: [] }) returned by the API

// Flatten the tree (depth first, so children follow their parent) into options labelled with their full path.
// A category and everything beneath it can be left out, e.g. when choosing where to move a category to.
export function flattenCategories(tree, { excludeID = null } = {}) {
  const options = []
  const walk = (nodes, trail) => {
    nodes.forEach((node) => {
      if (node.id === excludeID) return
      const path = [...trail, node.name]
      options.push({ id: node.id, name: node.name, label: path.join(' › '), depth: trail.length })
      walk(node.subcategories, path)
    })
  }
  walk(tree, [])
  return options
}

// The ids from the top level category down to the given one (inclusive), or [] when it is not in the tree
export function findPathIDs(tree, id) {
  for (const node of tree) {
    if (node.id === id) return [node.id]
    const below = findPathIDs(node.subcategories, id)
    if (below.length) return [node.id, ...below]
  }
  return []
}

// The node for a category, including its subcategories, or null when it is not in the tree
export function findNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    const below = findNode(node.subcategories, id)
    if (below) return below
  }
  return null
}
