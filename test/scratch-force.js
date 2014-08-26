var convert = require('..'),
    Stx = convert.Stx,
    bp = require('../lib/bp'),
    pp = bp.pp,
    ometajs = require('ometajs'),
    lo = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    parser = require('../lib/ometa/bemhtml-bh').Parser,
    serializer = require('../lib/ometa/bemhtml-bh').XastToBh,
    bemparser = require('../lib/ometa/bemhtml').BEMHTMLParser,
    compat = require('bemhtml-compat'),
    jstrans = ometajs.grammars.BSJSTranslator,
    uglify = require('uglify-js'),
    colors = require('colors'),
    esprima = require('esprima'),
    Bh = require('bh').BH,
    escodegen = require('escodegen'),
    projectRoot = path.resolve(path.join(__dirname, '..')),
    casesRoot = path.join(projectRoot, 'test', 'cases'),
    files = fs.readdirSync(casesRoot),
    templates = lo.map(files,
                       function(f) {
                           return path.basename(f, '.bemhtml');
                       });

var differ = require('html-differ'),
    difflogger = require('html-differ/lib/diff-logger'),
    options = {
        ignoreHtmlAttrs: [],
        compareHtmlAttrsAsJSON: [],
        ignoreWhitespaces: true,
        ignoreHtmlComments: true,
        bem: false
    };

// // return applyNext
// var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/navigation/_more-type/navigation_more-type_tablo.bemhtml',

var bemhtmlsrc = 'scratch.bemhtml',

    stx = new Stx(fs.readFileSync(bemhtmlsrc, 'utf8')),
    dirname = path.dirname(bemhtmlsrc),
    name = path.basename(bemhtmlsrc, '.bemhtml'),
    bemjson = fs.readFileSync(dirname + '/' + name + '.json', 'utf8'),
    json1 = JSON.parse(bemjson),
    json2 = lo.cloneDeep(json1);

pp(bemjson, {prompt: dirname + '/' + name + '.json'});                             // show json
stx.bemhtml.pp({prompt: 'bemhtml'});                      // show bemhtml

stx.bh.beautify().pp({prompt: 'bh generated'});            // show bh-generated

var htmlExpectedBemhtml = stx.match(json1),
    html = stx.bh.match(json2),
    diffBemhtml = differ.diffHtml(html, htmlExpectedBemhtml);

if (!differ.isEqual(html, htmlExpectedBemhtml)) {
    difflogger.log(diffBemhtml, { charsAroundDiff: 500 }); // show html-diff
    console.log('\nHTML from bh'.red, '\n', html);
    console.log('\nHTML from bemhtml'.green, '\n', htmlExpectedBemhtml);
}
