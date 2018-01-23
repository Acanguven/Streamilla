const express = require('express');
const app = express();
const Milla = require('../src');
const path = require('path');
const hbs = require('handlebars');

Milla.config.set({
  minifyJs: false,
  minifyCss: false,
  minifyHtml: false
});

const renderList = hbs.compile(`
  <ul class="test">
    {{#each array}}
      <li>{{this}}</li>
    {{/each}} 
  </ul>
`);

app.get('/', Milla.express({
  htmlFile: path.join(__dirname, '../test/html/test8.html'),
  data: {
    header: (req) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            menu: ['Item 1', 'Item 2', 'Item 3']
          });
        }, 4000 * Math.random())
      });
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
      content: (data) => {
        return renderList({
          array: data.menu
        })
      },
      placeholder: () => '<div>List Loading...</div>'
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
