var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint;
var assert = require('assert');
var diff = require('html-differ');
var ibem = require('./i-bem');

/**********
 playground
 **********/

var temp = stx.get(function () {/*

    block('button')(
        def()(function() {
            var mods = this.mods;
            applyNext({ _button : this.ctx });
        }),

        tag()(function() {
            return this.ctx.tag || 'button';
        }),

        js()(true),


        mix()([{ elem : 'control' }]),

        attrs()(

            function() {
                var ctx = this.ctx,
                    attrs = { role : 'button' };

                ctx.tabIndex && (attrs.tabindex = ctx.tabIndex);

                return attrs;
            },


            match(function() { return !this.mods.type })(function() {
                var ctx = this.ctx,
                    attrs = {};

                ctx.tag || (attrs.type = ctx.type || 'button');

                ctx.name && (attrs.name = ctx.name);
                ctx.val && (attrs.value = ctx.val);
                this.mods.disabled && (attrs.disabled = 'disabled');

                return this._.extend(applyNext(), attrs);
            })
        ),

        content()(
            function() {
                var ctx = this.ctx, content = [this.ctx.icon];

                ctx.text && content.push({ elem : 'text', content : ctx.text });
                return content;
            },
            match(function() { return typeof this.ctx.content !== 'undefined' })(function() {
                return this.ctx.content;
            })
        )
    );

                       */});

var tempbh = (function(bh) {

    bh.match('button', function(ctx, json) {
        ctx.tParam('_button', json);

        ctx.js(true);

        ctx.attr('role', 'button').mix({ elem : 'control' });

        json.tabIndex && ctx.attr('tabindex', json.tabIndex);

        // Attributes for button variant
        if(!ctx.mod('type')) {
            json.tag || ctx.attr('type', json.type || 'button');
            json.name && ctx.attr('name', json.name);
            json.val && ctx.attr('value', json.val);
            ctx.mod('disabled') && ctx.attr('disabled', 'disabled');
        }

        ctx.tag(json.tag || 'button');

        var content = ctx.content();
        if(typeof content === 'undefined') {
            content = [json.icon];
            json.text && content.push({ elem : 'text', content : json.text });
            ctx.content(content);
        }
    });

    return bh;

}) (bh.create ());


// diff shows a missing `;` at the end of `onclick = return {}` in
// html generated from old syntax. i-bem.js is to blame. Adding `;` to
// i-bem.js in the next commit.
diff.bemDiff(bh.tohtml(tempbh)({block: 'button'}),
             stx.tohtml (temp) ({block: 'button'}));








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
