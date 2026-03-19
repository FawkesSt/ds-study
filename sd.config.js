import StyleDictionary from 'style-dictionary'

const sd = new StyleDictionary({
  source: [
    'tokens/primitives.json',
    'tokens/semantic.json',
    'tokens/components.json'
  ],
  hooks: {
    transforms: {
      'dimension/px': {
        type: 'value',
        filter: (token) => token.type === 'dimension',
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