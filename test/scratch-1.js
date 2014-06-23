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
var temp = stx.get(function(){/*

    block logo {

    !this.elem, content: [
        {
            elem: 'link',
            url: this.ctx.url,
            content: {
                elem: 'image',
                alt: this.ctx.alt,
                url: this.ctx.image
            }
        },
        this.ctx.content
    ]

    elem link {
        tag: 'a'
        attrs: { href: this.ctx.url }
    }

    elem image {
        tag: 'img'
        attrs: {
            alt: this.ctx.alt || '',
            src: this.ctx.url
        }
    }
}
*/});


//console.log(bh.tohtml(tempbh1)({block: 'logo'}));
console.log(stx.tohtml (temp)({
    block: "logo",
    content:     {
        elem: 'link',
        url: 'yandex.ru'
    }
}));

console.log(stx.tohtml (temp)({
    block: "logo"
}));


// Source: examples near the bottom of the page in
// http://ru.bem.info/libs/bem-core/2.2.0/templating/bemhtml-js-syntax


var temp1 = stx.get(function () {/*

    block logo {
        tag: 'img'
    }

*/});

var tempbh1 = bh.get(function(bh) {

    bh.match('logo', function(ctx, json) {
        ctx.tag('img');
    });

});


diff.isEqual(bh.tohtml(tempbh1)({block: 'logo'}),
             stx.tohtml (temp1) ({block: 'logo'}));

console.log(bh.tohtml(tempbh1)({block: 'logo', tag: 'a'}));
console.log(stx.tohtml (temp1)({block: 'logo'}));

tempbh = bh.get(function(bh) {

    bh.match('button', function(ctx) {
        ctx.mix({ block: 'link', mods: { pseudo: 'yes' } });
        ctx.mix([
            { elem: 'text' },
            { block: 'ajax' }
        ]);
    });

});

console.log(bh.tohtml(tempbh)({block: 'button'}));

var temp2 = stx.get(function(){/*
block logo {
  tag: 'img'
  attrs: ({alt: 'logo', href: 'http://...'})

}
                                */});


var tempbh2 = bh.get(function(bh) {

    bh.match('logo', function(ctx, json) {
        ctx.tag(json.tag || 'img');
        ctx.mod('native', 'yes');
        ctx.mod('disabled', true);
    });

});

diff.isEqual(bh.tohtml(tempbh2)({block: 'button'}),
             stx.tohtml (temp2) ({block: 'button'}));

console.log(bh.tohtml(tempbh2)({block: 'logo'}));
console.log(stx.tohtml (temp2)({block: 'logo'}));

var temp3 = stx.getSource(function(){/*
block b-page {
  tag: 'html'
  bem: false
}
                                */});

var temp4 = stx.getSource(function(){/*
block b-text {
    this.elem, tag: this.ctx.elem
    this.elem, this.ctx.id, attrs: { id: this.ctx.id  }
}
                                */});

var temp5 = stx.getSource(function(){/*
block b-bla {
  tag:'span'
  mod 0-mode v2, tag:'a'
  mix: [ { elemMods: { m2: 'v2' }} ]
  js: true
}
                                */});

var temp6 = stx.getSource(function(){/*
block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx })
                                */});

var temp7 = stx.getSource(function(){/*
block b-link, elem e1 {
  tag: 'span'
  this.ctx.url {
     tag: 'a'
     attrs: { href: this.ctx.url }
     reset {
         attrs: { href: undefined }
      }
   }
}
                                */});
