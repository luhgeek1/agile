import path from 'node:path'

const layers = ['shared', 'entities', 'features', 'widgets', 'views', 'app']
const slicedLayers = new Set(['entities', 'features', 'widgets', 'views'])

export const fsdBoundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      layer: 'FSD: {{source}} cannot depend on {{target}}. Import from a lower layer.',
      slice:
        'FSD: slices on the same layer are isolated. Use an explicit entity @x API when needed.',
      publicApi: 'FSD: import another slice through its public index.ts API.',
    },
  },
  create(context) {
    const filename = context.filename
    const sourceRoot = filename.slice(0, filename.lastIndexOf(`${path.sep}src${path.sep}`) + 5)
    const sourceParts = path.relative(sourceRoot, filename).split(path.sep)
    const sourceLayer = sourceParts[0]
    if (!layers.includes(sourceLayer)) return {}

    const check = (node, specifier) => {
      if (typeof specifier !== 'string') return
      let targetPath
      if (specifier.startsWith('@/')) targetPath = path.join(sourceRoot, specifier.slice(2))
      else if (specifier.startsWith('.'))
        targetPath = path.resolve(path.dirname(filename), specifier)
      else return
      const targetParts = path.relative(sourceRoot, targetPath).split(path.sep)
      const [targetLayer, targetSlice] = targetParts
      if (!layers.includes(targetLayer)) return
      if (layers.indexOf(targetLayer) > layers.indexOf(sourceLayer)) {
        context.report({
          node,
          messageId: 'layer',
          data: { source: sourceLayer, target: targetLayer },
        })
        return
      }
      const sameSlice = sourceLayer === targetLayer && sourceParts[1] === targetSlice
      const explicitCrossImport =
        sourceLayer === 'entities' &&
        targetLayer === 'entities' &&
        targetParts[2] === '@x' &&
        targetParts.length === 4 &&
        targetParts[3].replace(/\.[cm]?[jt]sx?$/, '') === sourceParts[1]
      if (
        sourceLayer === targetLayer &&
        slicedLayers.has(sourceLayer) &&
        !sameSlice &&
        !explicitCrossImport
      ) {
        context.report({ node, messageId: 'slice' })
        return
      }
      if (
        slicedLayers.has(targetLayer) &&
        !sameSlice &&
        !explicitCrossImport &&
        targetParts.length > 2 &&
        !(targetParts.length === 3 && /^index(?:\.[cm]?[jt]sx?)?$/.test(targetParts[2]))
      ) {
        context.report({ node, messageId: 'publicApi' })
      }
    }
    return {
      ImportDeclaration: (node) => check(node, node.source.value),
      ExportNamedDeclaration: (node) => check(node, node.source?.value),
      ExportAllDeclaration: (node) => check(node, node.source.value),
      ImportExpression: (node) => check(node, node.source.value),
    }
  },
}
