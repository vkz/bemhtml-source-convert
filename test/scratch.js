var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint,
    pb = convert.toBrowser,
    assert = require('assert'),
    diff = require('html-differ'),
    ibem = require('./i-bem');


///////////////////////
// Types 1.1 and 1.2 //
///////////////////////

var temp11 = stx.get(function () {/*
   block button, tag: 'button'
*/});


stx.tohtml (temp11)({block: 'button'});
var ast11 = stx.parse(temp11);

var temp12 = stx.get(function () {/*
   block button {
       tag: 'button'
   }
*/});

stx.tohtml (temp12)({block: 'button'});
var ast12 = stx.parse(temp12);

assert.deepEqual(ast11, ast12);
// Can't differentiate between templates of type 1.1 and 1.2 at a
// tree level. Both types are parsed into canonical type 2.2 - all
// predicates use BEM context dependent fiels e.g.
// this.block === 'button', this._mode === tag, etc.


///////////////////////
// Types 2.1 and 2.2 //
///////////////////////

var temp21 = stx.get(function () {/*
   block button {
       tag: 'button'
       typeof this.ctx.url !== 'undefined' {
                      tag: 'a'
                      attrs: {href: this.ctx.url}
                     }
   }
*/});

stx.tohtml (temp21)({block: 'button', url: ''});
var ast21 = stx.parse(temp21);

var temp22_a = stx.get(function(){/*
block button {
    this.elem, tag: this.ctx.elem
    this.elem, this.ctx.id, attrs: { id: this.ctx.id  }
}
*/});

stx.tohtml (temp22_a)({block: 'button', elem: 'e1', id: 'id1'});
var ast22_a = stx.parse(temp22_a);

var temp22_b = stx.get(function(){/*
block button {
    tag, ~['mark', 'item', 'text'].indexOf(this.elem): 'span'
}
*/});

stx.tohtml (temp22_b)({block: 'button'});
var ast22_b = stx.parse(temp22_b);

// By analyzing parsed templates I can differentiate between 2.1 and
// 2.2. Arbitrary js will still be parsed into something whose
// elements can be analyzed, e.g. [].indexOf(this.elem) is parsed into
// ["call" [func] [arg]] where we can check if 'func' and 'arg'
// reference 'this.ctx' or BEM context fields. No reason why this
// wouldn't work for 2.3, but generally such templates will almost
// certainly have have type 3 bodies, 3.3 even cause custom context
// fields only make sense with recursive calls to `applyNext` and
// `applyCtx`

/////////
// end //
/////////

/** playground **/

// // decent way to load tests, not so good for experimenting since
// // required libraries are cashed
// var template = {old: stx.get(require ('./cases/button.old')),
//                 bh:  bh.get(require ('./cases/button.bh'))};

// diff.isEqual(bh.tohtml(tempbh1)({block: 'logo'}),
//              stx.tohtml (temp1) ({block: 'logo'}));


// var temp1 = stx.get(function () {/*
//     block logo {
//         tag: 'img'
//     }
// */});

// var tempbh1 = bh.get(function(bh) {
//     bh.match('logo', function(ctx, json) {
//         ctx.tag('img');
//     });
// });

// var temp2 = stx.get(function(){/*
// block logo {
//   tag: 'img'
//   attrs: ({alt: 'logo', href: 'http://...'})

// }
//                                 */});

// var tempbh2 = bh.get(function(bh) {
//     bh.match('logo', function(ctx, json) {
//         ctx.tag(json.tag || 'img');
//         ctx.mod('native', 'yes');
//         ctx.mod('disabled', true);
//     });

// });

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

// var temp7 = stx.get(function(){/*
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
