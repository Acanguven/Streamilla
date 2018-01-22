const expect = require('chai').expect;
const Milla = require('../src');
const path = require('path');

describe('Render', () => {
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
    });

    middleWare({}, {
      write: (data) => {
        expect(data).to.equal('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Milla Title</title><script>function $p(p,c){var c = document.getElementById(c),r = c.innerHTML;c.remove();document.getElementById(p).innerHTML=r}</script><style>.test{color:red}[p]{display:none;}</style></head><body><div id="c_0"><div>Example of placeholder content</div></div><div>Middle Content</div><div id="c_1"><div>Example of placeholder content</div></div><script>function _f_0(){console.log("I am alive");};</script></body></html>');
        done();
      },
      end: () => {

      }
    });
  });
});
