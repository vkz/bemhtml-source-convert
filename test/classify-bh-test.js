var convert = require('..'),
    stx = convert.stx,
    utils = convert.utils,
    pp = utils.pp,
    pb = utils.pb,
    contains = utils.contains,
    ometajs = require('ometajs'),
    compat = require('bemhtml-compat'),
    lo = require('lodash'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    testingMsg = '\n' +
        '**********************\n' +
        'Classifying templates.\n' +
        '**********************\n';

describe(testingMsg, function (){

    var projectRoot = path.resolve(path.join(__dirname, '..')),
        casesRoot = path.join(projectRoot, 'test', 'cases'),
        files = fs.readdirSync(casesRoot),
        templates = lo.map(files,
                           function(f) {
                               return path.basename(f, '.bemhtml');
                           });

    files = lo(files)
        .map(function (f) {return path.join(casesRoot, f);})
        .map(function (f) {return fs.readFileSync(f, 'utf-8');})
        .value();

    templates = lo.zipObject(templates,
                             files);

    function haveClass (classObj, className) {
        className = JSON.stringify(className); // in case its a number
        var classes = [].concat(classObj.c1,
                                classObj.c2,
                                classObj.c3);
        return lo.contains(classes, className);
    };
    function doesNot (anything) {return !anything;};

    function classify (template) {
        return lo.first(stx.classify2(template));
    };

    describe(templates.temp11, function () {
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () { classified = classify (templates.temp11); }
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

    describe(templates.temp12, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () { classified = classify (templates.temp12); }
            );
        });

        it('Should be classified into 1.2',
           function () {
               assert.ok(haveClass(classified, 1.2));
           });

        it('Should be classified into 2.3',
           function () {
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

    describe(templates.temp21_a, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp21_a);
                }
            );
        });

        it('Should be classified into 1.2',
           function () {
               assert.ok(haveClass(classified, 1.2));
           });

        it('Should be classified into 2.1',
           function () {
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

    describe(templates.temp21_b, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp21_b);
                }
            );
        });

        it('Should be classified into 1.2',
           function () {
               assert.ok(haveClass(classified, 1.2));
           });

        it('Should be classified into 2.1',
           function () {
               assert.ok(haveClass(classified, 2.1));
               assert.ok(doesNot(haveClass (classified, 2.2)));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

    });

    describe(templates.temp22_a, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp22_a);
                }
            );
        });

        it('Should be classified into 1.2',
           function () {
               assert.ok(haveClass(classified, 1.2));
           });

        it('Should be classified into 2.2',
           function () {
               assert.ok(haveClass(classified, 2.2));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

    });

    describe(templates.temp22_b, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp22_b);
                }
            );
        });

        // it('Should be classified into 1.2',
        //    function () {
        //        assert.ok(haveClass(classified, 1.2));
        //    });

        it('Should be classified into 2.2',
           function () {
               assert.ok(haveClass(classified, 2.2));
               assert.ok(doesNot(haveClass (classified, 2.1)));
               assert.ok(doesNot(haveClass (classified, 2.3)));
           });

    });


    describe(templates.temp32, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp32);
                }
            );
        });

        it('Should be classified into 3.2',
           function () {
               assert.ok(haveClass(classified, 3.2));
               assert.ok(doesNot(haveClass (classified, 3.3)));
           });

    });


    describe(templates.temp33_c, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp33_c);
                }
            );
        });

        it('Should be classified into 3.3',
           function () {
               assert.ok(haveClass(classified, 3.3));
           });
    });

    describe(templates.temp33_a, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp33_a);
                }
            );
        });

        it('Should be classified into 3.3',
           function () {
               assert.ok(haveClass(classified, 3.3));
           });
    });

    describe(templates.temp33_b, function (){
        var classified;

        it('Should be parsed and classified', function(){
            assert.doesNotThrow(
                function () {
                    classified = classify (templates.temp33_b);
                }
            );
        });

        // it('Should be classified into 1.2',
        //    function () {
        //        assert.ok(haveClass(classified, 1.2));
        //    });

        it('Should be classified into 3.3',
           function () {
               assert.ok(haveClass(classified, 3.3));
           });

    });


});
