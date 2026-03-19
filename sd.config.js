import StyleDictionary from 'style-dictionary'

// Deep merge helper
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !source[key].value
    ) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// Preprocessor — deep merges collection wrappers
StyleDictionary.registerPreprocessor({
  name: 'strip-collection-wrappers',
  preprocessor: (dictionary) => {
    const collectionKeys = ['Primitives', 'Semantic', 'Components']
    const result = {}

    for (const [key, value] of Object.entries(dictionary)) {
      if (collectionKeys.includes(key)) {
        deepMerge(result, value)
      } else {
        result[key] = value
      }
    }

    return result
  }
})

const sd = new StyleDictionary({
  log: { verbosity: 'verbose' },
  source: ['tokens/tokens.json'],
  preprocessors: ['strip-collection-wrappers'],
  hooks: {
    transforms: {
      'dimension/px': {
        type: 'value',
        filter: (token) => [
          'dimension',
          'spacing',
          'borderRadius',
          'fontSizes',
        ].includes(token.type),
        transform: (token) => {
          const val = parseFloat(token.value)
          return isNaN(val) ? token.value : `${val}px`
        }
      }
    },
    transformGroups: {
      'css/custom': [
        'name/kebab',
        'color/css',
        'dimension/px',
      ]
    }
  },
  platforms: {
    css: {
      transformGroup: 'css/custom',
      prefix: 'ds',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables'
        }
      ]
    }
  }
})

await sd.buildAllPlatforms()