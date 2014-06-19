var convert = exports;

// to compile old stx into js syntax
var compat  = require('bemhtml-compat');

// to translate bemhtml-compat ast to astxjst
var ometajs = require('ometajs');
var ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST;

// to compile old templates
var ibem = require('bemhtml-compat/test/fixtures/i-bem');
var bemxjst = require('bem-xjst');

// create an instance before defining bh-templates
// var bh = new BH();
var BH = require('bh').BH;

// to compare html output of old and bh templates
var diff = require('html-differ');

convert.stx = {
    // (-> stx astxjst)
    parse: function (src) {
        return ast2astxjst.match(compat.parse (src), 'topLevel');
    },
    // (-> stx stxjs)
    transpile: function (src) {return compat.transpile(src);}
};

convert.stxjs = {
    // (-> stxjs astxjst)
    parse: function (src) { throw("not implemented");}
};

/*****
 utils
 *****/

function pp(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function getSource(fn) {
    return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

// returns a function that takes bemjson to produce html
function old2html (src) {
    var srcjs = convert.stx.transpile(ibem + src);
    var compiled = bemxjst.compile(srcjs, {});
    return function(json) { return compiled.apply.call(json);};
}

// returns a function that takes bemjson to produce html
function bh2html (bh) {
    return function (json) {return bh.apply(json);};
}

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
src = temp2;
xast = convert.stx.parse(src);
srcjs = convert.stx.transpile(src);
old2html(src)({block: 'logo'});

resold = old2html('block button, tag: \'button\'')(json);

// bh stx
var bh = new BH();
bh.match('button', function(ctx, json) {
    ctx.tag('button');
});

resbh = bh2html(bh)(json);


// diff old vs bh
diff.isEqual(resold, resbh);
