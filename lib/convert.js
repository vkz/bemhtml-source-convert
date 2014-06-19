var convert = exports;

var compat  = require('bemhtml-compat');
var ometajs = require('ometajs');
var ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST;

var ibem = require('bemhtml-compat/test/fixtures/i-bem');
var bemxjst = require('bem-xjst');

var BH = require('bh').BH;

var diff = require('html-differ');

/*****
 api
 *****/

convert.stx = {
    // (-> stx astxjst)
    parse: function (src) {
        return ast2astxjst.match(compat.parse (src), 'topLevel');
    },
    // (-> stx stxjs)
    toStxjs: function (src) { return compat.transpile(src); },
    toHtml: stx2html,
    getSource: getSource
};

convert.stxjs = {
    // (-> stxjs astxjst)
    parse: function (src) { throw("not implemented");},
    toHtml: stxjs2html
};

convert.bh = {
    create: function() { return new BH(); },
    toHtml: bh2html
};

convert.prettyPrint = prettyPrint;

function prettyPrint(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function getSource(fn) {
    return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

// (-> stx json html)
// (-> bh json html)
// (-> stxjs json html)
function stx2html (src) {
    var srcjs = compat.transpile(ibem + src);
    var compiled = bemxjst.compile(srcjs, {});
    return function(json) { return compiled.apply.call(json);};
}

function bh2html (bh) {
    return function (json) {return bh.apply(json);};
}

function stxjs2html(srcjs) {
    return function(json ) {throw("not implemented");};
}

/**********
 playground
 **********/
