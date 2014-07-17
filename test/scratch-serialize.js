var convert = require('..'),
    stx = convert.stx,
    pp = convert.utils.pp,
    ometajs = require('ometajs'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    parser = require('../lib/ometa/bemhtml-bh').Parser,
    serializer = require('../lib/ometa/bemhtml-bh').XastToBh,
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    uglify = require('uglify-js'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    projectRoot = path.resolve(path.join(__dirname, '..')),
    casesRoot = path.join(projectRoot, 'test', 'cases'),
    files = fs.readdirSync(casesRoot),
    templates = lo.map(files,
                       function(f) {
                           return path.basename(f, '.bemhtml');
                       });

files = lo(files).
    map(function (f) {return path.join(casesRoot, f);}).
    map(function (f) {return fs.readFileSync(f, 'utf-8');}).
    value();

templates = lo.zipObject (templates,
                          files);

function parse(src) {
    return bemparser.matchAll(src, 'topLevel');
}

// beautify and print using my prettyPrinter
function b(code) {
    var stream = uglify.OutputStream({beautify: true });
    var uast = uglify.parse (code);
    code = uast.print(stream);
    pp(stream.toString());

}

// var temp = stx.get(function() {/*
//     block list {
//         elem item, tag: 'li'
//     }
// */});


// var temp = stx.get(function() {/*
// block input, mod theme black, elem hint, tag: a
// */});

var temp = stx.get(function() {/*
block input, mod theme black, elem hint, elemMod visibility visible, tag: a
*/});

var xast = stx.parse(temp);
pp(xast);

var code = serializer.match (xast, 'topLevel');
//escodegen.generate(esprima.parse (code));
//escodegen.generate(esprima.parse ('function (){return 42;}'));
//esprima.parse('function func() {};');

b(code);
