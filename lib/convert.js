var convert = exports,
    bp = require('./bp'),
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    lo = require('lodash'),
    bemhtml2bh = require('../lib/ometa/bemhtml-bh'),
    parser = bemhtml2bh.Parser,
    classifier = bemhtml2bh.Classifier,
    serializer = bemhtml2bh.XastToBh,
    isError = require('util').isError,
    colors = require('colors');

function Stx (src) {
    var classes,
        ast,
        bh,
        src = this.src = (this.bemhtml = new bp.Bemhtml(src)).src;

    Object.defineProperties (this, {
        'class': {
            'get': function() { return classes || (classes = classify(src)); },
            'set': function(v) { classes = v; },
            enumerable: true
        },
        'ast': {
            'get': function() { return ast || (ast = parse(src)); },
            'set': function(v) { ast = v; },
            enumerable: true
        },

        'bh': {
            'get': function() { return bh || (bh = toBh(this.ast.get())); },
            'set': function(v) { bh = v; },
            enumerable: true
        }
    });
}

function classify(src) {
    return classifier.match(compat.parse(src), 'topLevel');
}

function parse(src) {
    return new bp.Ast(parser.matchAll(src, 'topLevel'));
}

function toBh(ast) {
    return serializer.match(ast, 'topLevel');
}

Stx.prototype = {
    match: function match(json) {
       return this.bemhtml.match(json);
    }
};
bp.addPrettyPrinter(Stx.prototype);
convert.Stx = Stx;

convert.run = function run(options) {
    var input = [],
        out = [],
        err = [],
        stderr = process.stderr;

    options.input
        .on('data', function(chunk) { input.push(chunk); })
        .on('end', function() { finish(input.join('')); })
        .resume();

    function addHtmlDiff(out, stx, json) {
        var differ = require('html-differ'),
            difflogger = require('html-differ/lib/diff-logger'),
            beautify = require('js-beautify').html,
            jsonCopy = lo.cloneDeep(json),
            htmlExpected = stx.match(json),
            htmlBh = stx.bh.match(jsonCopy, options.setOptions),
            htmldiff = differ.diffHtml(htmlBh, htmlExpected);

        return out.push(
            differ.isEqual(htmlBh, htmlExpected) ?
                beautify(htmlBh) :
                'expected '.green +
                'actual'.red      +
                beautify(
                    difflogger
                        .getDiffText(htmldiff, { charsAroundDiff: 500 })));
    }

    function addMetaInfo(out, stx) {
        out.push(
            stx.class.describe(),
            stx.ast.pp({ stringify: true }));
    }

    function finish(source) {
        var output = options.output,
            stx = new Stx(source),
            bh;


        try {
            bh = stx
                .bh
                .beautify();
        } catch (e) {
            console.log(e);
            err.push(
                'Error'.bold.red + ' detected while converting template'.blue, '\n',
                stx.src,
                bp.formatWarnings(e),
                e.message);
            addMetaInfo(err, stx);
            stderr.write(err.join('\n'));
            stderr.end('\n');
            throw e;
        }

        out.push(bh.src);

        options.bemjson && addHtmlDiff(out, stx, options.bemjson);

        options.verbose && addMetaInfo(out, stx);

        output.write(out.join('\n'));
        output.end('\n');
    }
};
