var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint;
var assert = require('assert');
var diff = require('html-differ');
var ibem = require('./i-bem');


var template = {old: stx.get(require ('./cases/button.old')),
                bh:  bh.get(require ('./cases/button.bh'))};


/**********
 playground
 **********/

stx.tohtml(template.old)({block: 'button', content: "hello"});
bh.tohtml(template.bh)({block: 'button', content: "hello"});

diff.bemDiff(bh.tohtml(template.bh)({block: 'button'}),
             stx.tohtml (template.old) ({block: 'button'}));

diff.isEqual (bh.tohtml(template.bh)({block: 'button'}),
              stx.tohtml (template.old) ({block: 'button'}));









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
