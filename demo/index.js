const express = require('express');
const app = express();
const Milla = require('../src');
const path = require('path');

Milla.config.set({
  minifyJs: false,
  minifyCss: false,
  minifyHtml: false
});

app.get('/', Milla.express({
  htmlFile: path.join(__dirname, '../test/html/test8.html'),
  data: {
    header: () => {
    },
    product: () => {
    }
  },
  fragments: {
    header: {
      placeholder: () => '',
      content: (input) => `test:${input.test}`
    },
    product: {
      placeholder: () => '',
      content: () => ''
    }
  }
}));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
