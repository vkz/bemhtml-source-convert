var convert = require('..'),
    stx = convert.stx,
    pp = convert.prettyPrint,
    pb = convert.toBrowser,
    ometajs = require('ometajs'),
    compat = require('bemhtml-compat'),
    lo = require('lodash'),
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser;

var temp11 = stx.get(function () {/*
   block button, tag: 'button'
*/});

var temp12 = stx.get(function () {/*
   block button {
       tag: 'button'
       content: 'text'
       this._bla && this._bla === 'bla' { tag: 'a'}
   }
*/});

var temp21_a = stx.get(function () {/*
   block button {
       tag: 'button'
       this.ctx.url {
                      tag: 'a'
                      attrs: {href: this.ctx.url}
                     }
   }
*/});

var temp21_b = stx.get(function () {/*
   block button {
       tag: 'button'
       typeof this.ctx.url !== 'undefined' {
                      tag: 'a'
                      attrs: {href: this.ctx.url}
                     }
   }
*/});

var temp21_c = stx.get(function () {/*
   block button {
       tag: 'button'
       this.ctx.url {
                      tag: 'a'
                      attrs: {href: this.ctx.url}
                      this._bla, attrs: {href: this._bla}
                     }
   }
*/});

var temp22_a = stx.get(function(){/*
block button {
    this.elem, tag: this.ctx.elem
    this.elem, this.ctx.id, attrs: { id: this.ctx.id  }
}
*/});

var temp22_b = stx.get(function(){/*
block button {
    tag, ~['mark', 'item', 'text'].indexOf(this.elem): 'span'
}
*/});

var temps = {
    t11: temp11,
    t12: temp12,
    t21a: temp21_a,
    t21b: temp21_b,
    t22a: temp22_a,
    t22b: temp22_b
};

/** to see what custom predicate is parsed into */
// bemparser.matchAll('this._bla', 'bemCustom');


var asts = lo.mapValues(temps, stx.classify);
var classes = lo.values(asts).map(function(val) {return val[0];});

var a = lo.zipObject(lo.keys(temps),
                     classes);
