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
    header: (req) => {
      return {
        header: {
          menu: ['Item 1', 'Item 2', 'Item 3']
        }
      }
    },
    product: (req) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({product:{name:'Test'}});
        }, 4000 * Math.random())
      });
    }
  },
  fragments: {
    header: {
      content: (input) => JSON.stringify(input)
    },
    product: {
      placeholder: () => '<div>Product placeholder</div>',
      content: (input) => {
        return JSON.stringify(input);
      }
    }
  }
}));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
