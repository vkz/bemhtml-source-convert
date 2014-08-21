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

// files = lo(files).
//     map(function (f) {return path.join(casesRoot, f);}).
//     map(function (f) {return fs.readFileSync(f, 'utf-8');}).
//     value();
// templates = lo.zipObject (templates,
//                           files);

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

// // return applyNext(hash) - what does this convert into?
// var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/service/service.bemhtml',

// // return applyNext(hash) - what does this convert into?
// var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/serp-item/__title/serp-item__title.bemhtml',

// // return applyNext(hash) - what does this convert into?
// var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/navigation/navigation.bemhtml',

// indexOf and applyCtx
var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/serp-url/serp-url.bemhtml',

// // applyCtx and return applyNext()
// var bemhtmlsrc = '/Users/kozin/Documents/bh-migration-test/blocks/serp-sitelinks/serp-sitelinks.bemhtml',

    stx = new Stx(fs.readFileSync(bemhtmlsrc, 'utf8')),
    dirname = path.dirname(bemhtmlsrc),
    pathtail = dirname.slice('/Users/kozin/Documents/bh-migration-test/'.length),
    name = path.basename(bemhtmlsrc, '.bemhtml'),
    bemjson = fs.readFileSync(dirname + '/' + name + '.json', 'utf8'),
    json1 = JSON.parse(bemjson),
    json2 = lo.cloneDeep(json1),
    json3 = lo.cloneDeep(json1),
    bhHandWritten = require('/Users/kozin/Documents/granny/' + pathtail + '/' + name + '.bh.js'),
    bh = new Bh();


// var htmlExpectedBemhtml = stx.match(json1),
//     htmlExpectedBh;

pp(bemjson, {prompt: dirname + '/' + name + '.json'});                             // show json
// stx.bemhtml.pp({prompt: 'bemhtml'});                      // show bemhtml
// pp(bhHandWritten.toString(), {prompt: 'bh hand-written'}); // show bh

// stx.bh.beautify().pp({prompt: 'bh generated'});            // show bh-generated

// bhHandWritten(bh);
// htmlExpectedBh = bh.apply(json3);

// var html = stx.bh.match(json2),
//     diffBemhtml = differ.diffHtml(html, htmlExpectedBemhtml),
//     diffBh = differ.diffHtml(html, htmlExpectedBh);

// if (!differ.isEqual(html, htmlExpectedBemhtml)) {
//     pp('HTML bh-generated vs expected from bemhtml\n');
//     difflogger.log(diffBemhtml, { charsAroundDiff: 500 }); // show html-diff
//     console.log('BH'.underline, '\n', html);
//     console.log('BEMHTML'.underline, '\n', htmlExpectedBemhtml);
// }

// if (!differ.isEqual(html, htmlExpectedBh)) {
//     pp('HTML bh-generated vs expected from bh\n');
//     difflogger.log(diffBh, { charsAroundDiff: 500 });      // show html-diff
// }

var temp = new Stx(function() {/*
block service {
    default: {
        var ctx = this.ctx;
        this._urlAttrs = this.extend(ctx.urlAttrs, {
            onmousedown: ctx.counter,
            href: ctx.url
        });

        applyNext({
            _url: (ctx.url !== false) && (ctx.url || ''),
            _icon: (ctx.icon !== false),
            _name: (ctx.name !== false),
            'ctx.name': 'newname'
        });
    }
    content, !this.elem, this._url: {
        block: 'link',
        mix: { block: 'service', elem: 'url' },
        attrs: this._urlAttrs,
        content: applyNext()
    }
}
*/});
temp.bh.beautify().pp({prompt: 'bh'});
temp.pp(temp.src, {prompt: 'bemhtml'});
console.log('+ expected'.green, '- actual'.red);


function htmlDiff(stx, json) {
    var differ = require('html-differ'),
        difflogger = require('html-differ/lib/diff-logger'),
        jsonCopy = lo.cloneDeep(json),
        htmlExpected = stx.match(json),
        htmlBh = stx.bh.match(jsonCopy),
        htmldiff = differ.diffHtml(htmlBh, htmlExpected);

    console.log(json, '\n', htmlExpected);
    console.log(jsonCopy, '\n', htmlBh);

    return (differ.isEqual(htmlBh, htmlExpected) && htmlBh) ||
        difflogger.getDiffText(htmldiff, { charsAroundDiff: 500 });
}
