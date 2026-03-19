const StyleDictionary = require('style-dictionary')

module.exports = {
  source: [
    'tokens/primitives.json',
    'tokens/semantic.json',
    'tokens/components.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css',
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
}
