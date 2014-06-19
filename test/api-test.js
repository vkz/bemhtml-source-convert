var convert = require('..'),
    stx = convert.stx,
    bh = convert.bh,
    pp = convert.prettyPrint;

var diff = require('html-differ');

/**********
 playground
 **********/

var src = "";

// Source: examples near the bottom of the page in
// http://ru.bem.info/libs/bem-core/2.2.0/templating/bemhtml-js-syntax/

var temp1 = getSource(function(){/*
block logo {
  tag: 'img'
}
                                */});

var temp2 = getSource(function(){/*
block logo {
  tag: 'img'
  attrs: ({alt: 'logo', href: 'http://...'})
}
                                */});

var temp3 = getSource(function(){/*
block b-page {
  tag: 'html'
  bem: false
}
                                */});

var temp4 = getSource(function(){/*
block b-text {
    this.elem, tag: this.ctx.elem
    this.elem, this.ctx.id, attrs: { id: this.ctx.id  }
}
                                */});

var temp5 = getSource(function(){/*
block b-bla {
  tag:'span'
  mod 0-mode v2, tag:'a'
  mix: [ { elemMods: { m2: 'v2' }} ]
  js: true
}
                                */});

var temp6 = getSource(function(){/*
block b-inner, default: applyCtx({ block: 'b-wrapper', content: this.ctx })
                                */});

var temp7 = getSource(function(){/*
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

var resold,
    resbh,
    xast,
    srcjs;

var json = {block: "button"};

// old stx
var tempstx = 'block button, tag: \'button\'';
xast = stx.parse(tempstx);
srcjs = stx.toStxjs(tempstx);
resold = stx.toHtml(tempstx)(json);


// bh stx
var tempbh = bh.create();
tempbh.match('button', function(ctx, json) {
    ctx.tag('button');
});

resbh = bh.toHtml(tempbh)(json);


// diff old vs bh
diff.isEqual(resold, resbh);
