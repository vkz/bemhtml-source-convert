var convert = exports;

var compat  = require('bemhtml-compat');
var ometajs = require('ometajs');
var ast2astxjst = require('./ometa/bemhtml').BEMHTMLToXJST;

var ibem = require('../test/i-bem');
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
    tojs: function (src) { return compat.transpile(src); },
    tohtml: stx2html,
    get: getSource
};

convert.stxjs = {
    // (-> stxjs astxjst)
    parse: function(src) {throw("not implemented");},
    tohtml: stx2html            //see comment to stx2html why it works for stxjs
};

convert.bh = {
    create: function() { return new BH(); },
    tohtml: bh2html
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
    // NB: ibem is in js-syntax and compat.transpile leaves js intact
    // only transpiling the old syntax, which means it doesn't matter
    // wheather you stick ibem to old or js-syntax - compat.transpile
    // will do the right thing
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
