var convert = exports;
var compat  = require('bemhtml-compat');
var bemxjst = require('bem-xjst');
var ometajs = require('ometajs');
var ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST;

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

/**********
 playground
 **********/

var src = "";

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

src = temp1;
var xast = convert.stx.parse(src);
var srcjs = convert.stx.transpile(src);
