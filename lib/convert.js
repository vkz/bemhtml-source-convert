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
    },

    // -> {isEqual: boolean, html: string}
    htmlDiff: function htmlDiff(json, setOptions) {
        var htmlExpected = this.match(lo.cloneDeep(json)),
            htmlBh = this.bh.match(json, setOptions),
            differ = new (require('html-differ').HtmlDiffer)({
                ignoreWhitespaces: false,
                bem: false
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

    function addMetaInfo(out, stx) {
        out.push(
            'Template classification',
            stx.class.describe());
        //out.push(stx.ast.pp ({ stringify: true }));
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
            err.push(
                '\nConversion failed\n'.red,
                e.message);
            addMetaInfo(err, stx);
            err.push(stx.src);
            stderr.write(err.join('\n'));
            stderr.end('\n');
            throw e;
        }

        out.push(bh.src);

        options.bemjson && out.push('Html produced', stx.htmlDiff(options.bemjson, options.setOptions).html);

        options.verbose && addMetaInfo(out, stx);

        output.write(out.join('\n'));
        output.end('\n');
    }
};
