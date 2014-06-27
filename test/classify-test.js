var convert = require('..'),
    stx = convert.stx,
    pp = convert.prettyPrint,
    pb = convert.toBrowser,
    ometajs = require('ometajs'),
    compat = require('bemhtml-compat'),
    lo = require('lodash'),
    assert = require('assert'),
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser;

// Test templates

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


describe('Classify templates', function (){

    var templates = {
        t11: temp11,
        t12: temp12,
        t21a: temp21_a,
        t21b: temp21_b,
        t22a: temp22_a,
        t22b: temp22_b
    },
        classified = lo.
            mapValues(templates,
                      lo.compose(lo.first, stx.classify));

    function haveClass (classObj, className) {
        className = JSON.stringify(className); // in case its a number
        var classes = [].concat(classObj.c1,
                                classObj.c2,
                                classObj.c3);
        return lo.contains(classes, className);
    };
    function doesNot (anything) {return !anything;};

    function classify (template) {
        return lo.first(stx.classify(template));
    };

    describe('Group 1', function () {

        var classified;

        it('Should classify template 1', function(){
            assert.doesNotThrow(
                function () { classified = classify (templates.t11); }
            );
        });

        it('Should classify template 1 into 1.1',
           function () {
               assert.ok(haveClass(classified, 1.1));
               assert.ok(doesNot(haveClass(classified, 1.2)));
           });
    });

//    describe('Group 2', function (){} );

//    describe('Group 3', function (){} );

});


// var templates = {
//     t11: temp11,
//     t12: temp12,
//     t21a: temp21_a,
//     t21b: temp21_b,
//     t22a: temp22_a,
//     t22b: temp22_b
// };

/** to see what custom predicate is parsed into */
// bemparser.matchAll('this._bla', 'bemCustom');

// var classified = lo.
//         mapValues(templates,
//                   lo.compose(lo.first, stx.classify));

// console.log(classified);
