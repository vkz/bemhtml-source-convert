var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint;
var assert = require('assert');
var diff = require('html-differ');
var ibem = require('bemhtml-compat/test/fixtures/i-bem');

describe('bemhtml-source-convert/API', function () {

    var template = stx.get(function(){/*
      block b1, tag: 'a'
      block b1, content: {
        local('submode', { x: 1},
              this.p = true, this.z = {}, this.z.d = 'world') {
          this._buf.push('hello ' + this.z.d);
        }
        return apply('subcontent', this.x = '!');
      }
      block b1, subcontent: {
        return this.x;
      }
    */});


    describe('#stx', function () {

        it('should parse old syntax into xjst-ast', function () {
            var template = stx.get(function(){/*
                 block button, tag: 'button'
                */});
            var ast = stx.parse(template);
            assert.equal(JSON.stringify(ast),
                         '[["template",["binop","&&",["binop","&&",["unop","!",'   +
                         '["getp",["string","elem"],["this"]]],["binop","===",'    +
                         '["getp",["string","block"],["this"]],'                   +
                         '["string","button"]]],["binop","===",["getp",["string",' +
                         '"_mode"],["this"]],["string","tag"]]],["begin",'         +
                         '["return",["string","button"]]]]]' );

        });

        it('should compile old syntax into js-syntax', function () {
            var re = /(match\((function.*)+\)\(.*\);)+/i;
            assert(!!stx.tojs(template).match(re) === true);
        });

        it('should match bemjson against old syntax to produce html', function () {
            assert.equal(stx.tohtml(template)({ block: 'b1' }),
                         '<a class="b1">hello world!</a>');
        });


        it('should convert old syntax into bh', function () {
            assert.fail();
        });


    });


    describe('#stxjs', function () {
        it('should match bemjson against js-syntax to produce html', function () {
            assert.equal(stxjs.tohtml(stx.tojs(template))({ block: 'b1' }),
                         '<a class="b1">hello world!</a>');
        });

    });


    describe('#bh', function () {

    });



});


/**********
 playground
 **********/



// var resold,
//     resbh,
//     xast,
//     srcjs;

// var json = {block: "b-text"};

// // old stx
// var tempstx = temp6;
// xast = stx.parse(tempstx);
// srcjs = stx.toStxjs(tempstx);
// resold = stx.toHtml(tempstx)(json);


// // bh stx

// var tempbh = bh.create();
// tempbh.match('button', function(ctx, json) {
//     ctx.tag('button');
// });

// resbh = bh.toHtml(tempbh)(json);


// // diff old vs bh
// diff.isEqual(resold, resbh);



// // Source: examples near the bottom of the page in
// // http://ru.bem.info/libs/bem-core/2.2.0/templating/bemhtml-js-syntax/

// var temp1 = stx.getSource(function(){/*
// block logo {
//   tag: 'img'
// }
//                                 */});

// var temp2 = stx.getSource(function(){/*
// block logo {
//   tag: 'img'
//   attrs: ({alt: 'logo', href: 'http://...'})
// }
//                                 */});

// var temp3 = stx.getSource(function(){/*
// block b-page {
//   tag: 'html'
//   bem: false
// }
//                                 */});

// var temp4 = stx.getSource(function(){/*
// block b-text {
//     this.elem, tag: this.ctx.elem
//     this.elem, this.ctx.id, attrs: { id: this.ctx.id  }
// }
//                                 */});

// var temp5 = stx.getSource(function(){/*
// block b-bla {
//   tag:'span'
//   mod 0-mode v2, tag:'a'
//   mix: [ { elemMods: { m2: 'v2' }} ]
//   js: true
// }
//                                 */});

// var temp6 = stx.getSource(function(){/*
// block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx })
//                                 */});

// var temp7 = stx.getSource(function(){/*
// block b-link, elem e1 {
//   tag: 'span'
//   this.ctx.url {
//      tag: 'a'
//      attrs: { href: this.ctx.url }
//      reset {
//          attrs: { href: undefined }
//       }
//    }
// }
//                                 */});
