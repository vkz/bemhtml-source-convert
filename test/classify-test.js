var convert = require('..'),
    stx = convert.stx,
    pp = convert.prettyPrint,
    pb = convert.toBrowser,
    ometajs = require('ometajs'),
    compat = require('bemhtml-compat'),
    lo = require('lodash'),
    assert = require('assert'),
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    testingMsg = '\n' +
        '**********************\n' +
        'Classifying templates.\n' +
        '**********************\n';

var temp11 = stx.get(function () {/*
   block button, tag: 'button'
*/});

var  temp12 = stx.get(function () {/*
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

// ??? thould this be 3.2 or 3.3 ???
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

var temp32 = stx.get(function () {/*
block logo {
  tag: 'img'
  this.ctx.url, attrs: ({alt: 'logo', href: this.ctx.url})
}*/});

var temp33_a = stx.get(function () {/*
    block b-inner, default: applyCtx({ block: 'b-wrapper',
                                       content: this.ctx })
*/});

var temp33_b = stx.get(function () {/*
block b1 {
  content: [applyNext(), 'text2']
 }
*/});

var temp33_c = stx.get(function () {/*
    block logo {
        this.ctx.url, tag: 'a'
        attrs {
            true: {role: 'logo'}
            this.ctx.url: {
                var ctx = this.ctx,
                    p = applyNext(),
                    a = { href: ctx.url };
                return this._.extend(p, a);}
        }
}
*/});


/** Playground */

function getBody(maybeAst) {
    function dropLevel (ast) {
        return lo.flatten(lo.map (ast, lo.rest),
                          true);
    }
    if (typeof maybeAst == 'string') {
        maybeAst =  lo.rest(stx.classify(maybeAst));
    }
    var ast = lo.flatten(maybeAst, true).
            filter(function (e) { return lo.first(e) === 'body';});
    return dropLevel(dropLevel (ast));
}

var temp = stx.get(function () {/*
                                 block b1 {
                                 content: [applyNext(), 'text2']
                                 }*/});

function classify (template) {
    return lo.first(stx.classify(template));
};

var templates = {
    t11: temp11,
    t12: temp12,
    t21a: temp21_a,
    t21b: temp21_b,
    t22a: temp22_a,
    t22b: temp22_b,
    t32: temp32,
    t33a: temp33_a,
    t33b: temp33_b,
    t33c: temp33_c
};

var bodies = lo.mapValues(templates, classify);

// checks if a tree (array) contains a given subtree (any JS value)
function contains(tree, sub) {
    return lo.some(tree,
                   function(t) {
                       return lo.isEqual(t, sub) ||
                           lo.isArray(t) &&
                           contains(t, sub);
                   });
}

// how to generate a subtree
var sub = bemparser.matchAll('this.ctx.url', 'asgnExpr'),
    tree = bodies.t21a.asgnExpr;

// is subtree?
contains(tree, sub);



describe(testingMsg, function (){

    var templates = {
        t11: temp11,
        t12: temp12,
        t21a: temp21_a,
        t21b: temp21_b,
        t22a: temp22_a,
        t22b: temp22_b,
        t32: temp32,
        t33a: temp33_a,
        t33b: temp33_b,
        t33c: temp33_c
    };

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

    describe(templates.t11, function () {
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () { classified = classify (templates.t11); }
            );
        });

        it('Should be classified into 1.1',
           function () {
               assert.ok(haveClass(classified, 1.1));
               assert.ok(doesNot(haveClass(classified, 1.2)));
           });


        it('Should be classified into 3.1',
           function () {
               assert.ok(haveClass(classified, 3.1));
           });

    });

    describe(templates.t12, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () { classified = classify (templates.t12); }
            );
        });

        it('Should be classified into 1.2 and 2.3',
           function () {
               assert.ok(haveClass(classified, 1.2));
               assert.ok(haveClass(classified, 2.3));
               assert.ok(doesNot(haveClass (classified, 2.1)));
               assert.ok(doesNot(haveClass (classified, 2.2)));
           });

        it('Should be classified into 3.1',
           function () {
               assert.ok(haveClass(classified, 3.1));
               assert.ok(doesNot(haveClass (classified, 3.2)));
           });

    });

    describe(templates.t21a, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t21a);
                }
            );
        });

        it('Should be classified into 1.2 and 2.1',
           function () {
               assert.ok(haveClass(classified, 1.2));
               assert.ok(haveClass(classified, 2.1));
               assert.ok(doesNot(haveClass (classified, 2.2)));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

        it('Should be classified into 3.2',
           function () {
               assert.ok(haveClass(classified, 3.2));
               assert.ok(doesNot(haveClass (classified, 3.3)));
           });

    });

    describe(templates.t21b, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t21b);
                }
            );
        });

        it('Should be classified into 1.2 and 2.1',
           function () {
               assert.ok(haveClass(classified, 1.2));
               assert.ok(haveClass(classified, 2.1));
               assert.ok(doesNot(haveClass (classified, 2.2)));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

    });

    describe(templates.t22a, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t22a);
                }
            );
        });

        it('Should be classified into 1.2, 2.1 and 2.2',
           function () {
               assert.ok(haveClass(classified, 1.2));
               assert.ok(haveClass(classified, 2.1));
               assert.ok(haveClass(classified, 2.2));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

    });

    describe(templates.t22b, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t22b);
                }
            );
        });

        it('Should be classified into 1.2 and 2.2',
           function () {
               assert.ok(haveClass(classified, 1.2));
               assert.ok(haveClass(classified, 2.2));
               assert.ok(doesNot(haveClass (classified, 2.1)));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

    });


    describe(templates.t32, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t32);
                }
            );
        });

        it('Should be classified into 3.2',
           function () {
               assert.ok(haveClass(classified, 3.2));
               assert.ok(doesNot(haveClass (classified, 3.3)));
           });

    });


    describe(templates.t33c, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t33c);
                }
            );
        });

        it('Should be classified into 3.3',
           function () {
               assert.ok(haveClass(classified, 3.3));
           });
    });

    describe(templates.t33a, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t33a);
                }
            );
        });

        it('Should be classified into 3.3',
           function () {
               assert.ok(haveClass(classified, 3.3));
           });
    });

    describe(templates.t33b, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.t33b);
                }
            );
        });

        it('Should be classified into 3.3',
           function () {
               assert.ok(haveClass(classified, 3.3));
           });
    });


});
