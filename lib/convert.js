var convert = exports,
    bp = require('./bp'),
    compat  = require('bemhtml-compat'),
    ometajs = require('ometajs'),
    lo = require('lodash'),
    bemhtml2bh = require('../lib/ometa/bemhtml-bh'),
    parser = bemhtml2bh.Parser,
    classifier = bemhtml2bh.Classifier,
    serializer = bemhtml2bh.XastToBh,
    beautify = require('js-beautify').html,
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
            'get': function() { return bh || (bh = toBh(this)); },
            'set': function(v) { bh = v; },
            enumerable: true
        }
    });
}

function classify(src) {
    try {
        var classes = classifier.match(compat.parse(src), 'topLevel');
    } catch(e) {
        throw Error(
            'Failed to classify bemhtml source because: '
                + e.message + '\n');
    }
    return classes;
}

function parse(src) {
    try {
        var ast = parser.matchAll(src, 'topLevel');
    } catch(e) {
        throw Error(
            'Failed to parse bemhtml source because: '
                + e.message + '\n');
    }
    return new bp.Ast(ast);
}

function toBh(stx) {
    try {
        var bh = serializer.match(stx.ast.get(), 'topLevel')
                .beautify();
    } catch (e) {
        throw Error(
            'Failed to convert bemhtml into bh because: '
                + e.message + '\n\n'
                + bp.formatWarnings(e) + '\n');
    }
    return bh;
}

Stx.prototype = {
    match: function match(json) {
       return this.bemhtml.match(json);
    },

    // -> {isEqual: boolean, html: string}
    htmlDiff: function htmlDiff(json, setOptions) {
        var htmlExpected = this.match(lo.cloneDeep(json)),
            htmlBh = this.bh.match(json, setOptions),
            differ = new (require('html-differ').HtmlDiffer)({
                ignoreWhitespaces: false,
                bem: true
            }),
            diff = { isEqual: differ.isEqual(htmlBh, htmlExpected) };

        diff.html = diff.isEqual ?
            htmlBh :
            'expected '.green + 'actual'.red +
            require('html-differ/lib/diff-logger').getDiffText(
                differ.diffHtml(htmlBh, htmlExpected),
                { charsAroundDiff: 500 });
        return diff;
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

    function finish(source) {
        var output = options.output,
            stx = new Stx(source),
            bh;

        try {

            bh = stx.bh.beautify();
            out.push(bh.src);

            options.bemjson && out.push(
                'Html produced',
                stx.htmlDiff(
                    options.bemjson,
                    options.setOptions
                ).html);

            options.verbose && out.push(bp.getClassification(stx));

        } catch (e) {
            stderr.write(e.message);
            stderr.end('\n');
            throw e;
        }

        output.write(out.join('\n'));
        output.end('\n');
    }
};
