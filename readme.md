# TypeScript Transformer Library

[![build and test](https://github.com/soknaly/typescript-remove-decorators-transformer/actions/workflows/push.yml/badge.svg)](https://github.com/soknaly/typescript-remove-decorators-transformer/actions/workflows/push.yml)

<br />
<p align="center">
  <h3 align="center">typescript-remove-decorators-transformer</h3>

  <p align="center">
    This is the library to remove unnecessary decorators from your TypeScript code. This is particularly useful when sharing code between the backend and frontend, as it allows you to prevent backend-specific decorators from appearing in the frontend bundle.
    <br />
    <br />
  </p>
</p>

## Table of Contents

<!-- toc -->

- [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Usage with TypeScript Transformer](#usage-with-typescript-transformers)
  * [Usage with ts-loader](#usage-with-ts-loader)
- [References](#references)
- [License](#license)

<!-- tocstop -->

## Getting Started

### Installation
```bash
yarn add typescript-remove-decorators-transformer --dev
```

or

```bash
npm install typescript-remove-decorators-transformer --save-dev
```


### Usage with TypeScript Transformers
To use a transformer from this library, you need to pass it to the TypeScript compiler during the compilation process. This can be done by using the customTransformers option of the TypeScript compiler API.

Here is an example of how to use a transformer:

```typescript
import removeDecoratorsTransformer from 'typescript-remove-decorators-transformer';

const program = ts.createProgram(['./src/main.ts'], {});

const result = program.emit(
  undefined,
  undefined,
  undefined,
  false,
  {
    before: [removeDecoratorsTransformer([
      'Column',
      'Index',
      // decorators to remove
    ])]
  },
);
```
### Usage with ts-loader
If you are using ts-loader, you can use the getCustomTransformers option to provide your custom transformers. Here is an example:

```javascript
// webpack.config.js
const removeDecoratorsTransformer = require('typescript-remove-decorators-transformer').default;

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: program => ({
            before: [removeDecoratorsTransformer([
                'Column',
                // decorators to remove
            ])]
          })
        }
      }
    ]
  }
};
```
In this example, the removeDecoratorsTransformer is used to remove all decorators from the TypeScript code during the webpack build process.

## References
- https://github.com/itsdouges/typescript-transformer-handbook
- https://github.com/TypeStrong/ts-loader#getcustomtransformers

## License
MIT License