# objection-to-json

> Package to map objection.js result models to JSON-able objects according to a provided schema

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]

## Install

```bash
npm install --save objection-to-json
```

## Usage

```javascript
const processResultToJSON = require('objection-to-json');

// Build object containing Objection.js models of interest, keyed under their class name
const models = {
  Book,
  Author
};

const schema = {
  Book: {
    include: ['@all'], // include all fields
    exclude: '@pk' // exclude primary key field
  },
  Author: {
    include: ['name', '@fk'] // exclude foreign key fields
  },

  options: {
    excludeKeyIfNull: false // Keep fields even if they have a null value (default)
  }
};

const results = Book.query().eager('authors');

const resultJson = processResultToJSON(results, schema, models);
```
This results in a result like:
```javascript
resultJson === [
  {
    title: 'A Tale of Two Cities',
    category: 'fiction',
    authors: [
      { id: 102, name: 'Dickens, Charles' }
    ]
  },
  {
    'title': 'The Grapes of Wrath',
    category: 'fiction',
    authors: [
      { id: 204, name: 'Steinbeck, John' }
    ]
  },
  {
    title: 'Good Omens',
    category: 'fiction',
    authors: [
      { id: 23, name: 'Pratchett, Terry'},
      { id: 24, name: 'Gaiman, Neil' }
    ]
  }
];
```

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/objection-to-json.svg
[npm-url]: https://npmjs.org/package/objection-to-json
[travis-image]: https://img.shields.io/travis/jonestristand/objection-to-json/master.svg
[travis-url]: https://travis-ci.org/jonestristand/objection-to-json
[coveralls-image]: https://img.shields.io/coveralls/jonestristand/objection-to-json/master.svg
[coveralls-url]: https://coveralls.io/r/jonestristand/objection-to-json?branch=master