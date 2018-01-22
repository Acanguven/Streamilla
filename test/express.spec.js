const expect = require('chai').expect;
const Milla = require('../src');
const path = require('path');

describe('Express', () => {
  it('should return express middleware with', function () {
    expect(Milla.express({
      htmlFile: path.join(__dirname, './html/test8.html'),
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
    })).to.be.an('function')
  });

  it('should create placeholders for async data', function (done) {
    Milla.config.set({
      fragmentTag: 'fragment',
    });

    const middleWare = Milla.express({
      htmlFile: path.join(__dirname, './html/test8.html'),
      data: {
        header: {test: 4},
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
          content: (input) => `test:${input.test}`
        },
        product: {
          placeholder: () => '<div>Product placeholder</div>',
          content: (input) => {
            return JSON.stringify(input);
          }
        }
      }
    });

    middleWare({}, {
      write: (data) => {
        expect(data).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title><script>function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}</script><style>.test{color:red}[p]{display:none;}</style></head><body>test:4<script>console.log("Header is alive and working");</script><div>Middle Content</div><div id="c_1"><div>Product placeholder</div></div>');
        done();
      },
      end: () => {

      }
    });
  });
});
