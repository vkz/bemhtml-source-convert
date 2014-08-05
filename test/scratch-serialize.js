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
    jstrans = ometajs.grammars.BSJSTranslator,
    uglify = require('uglify-js'),
    colors = require('colors'),
    esprima = require('esprima'),
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

// var temp1 = new Stx(function() {/*
//     block list {
//         elem item, tag: 'li'
//     }
// */});


// var temp2 = new Stx(function() {/*
// block input, mod theme black, elem hint, tag: 'a'
// */});

// var temp3 = new Stx(function() {/*
// block input, mod theme black, elem hint, elemMod visibility visible, tag: 'a'
// */});

// var temp4 = new Stx(function() {/*
// block button {
//     tag: 'button'
//     content: 'Yandex'
//     this.ctx.url { tag: this.ctx.url }
// }
// */});

// // //try convert temp*
// // var temp = [temp1, temp2, temp3, temp4, temp5];
// // temp.forEach(
// //     function(t) {
// //         t.pp({prompt: 'bemhtml'});
// //         t.bh.beautify().pp({prompt: 'bh'});
// //     });

// // // why wouldn't it blow up on this input?
// // var e = new Stx('ohtu othu ethuo {nthoe }');
// // e.bh;

// // // random template from Granny
// // var t = new Stx("block serp-meta, elem text-wrap, tag: 'span'");
// // t.bemhtml.match({
// //     "block": "serp-meta",
// //     "elem": "text-wrap",
// //     "content": "Serp meta text-wrap content"
// // });

// // //try convert test/cases/*
// // lo(templates).forEach(function(src, name) {
// //     var t = new Stx(src);
// //     try {
// //         t.bh.beautify().pp({prompt: name});
// //     } catch(e) {
// //         console.log('!!!' + name.underline + '!!!');
// //     }
// // });

// // [
// //     templates.temp33_a,
// //     templates.temp33_b,
// //     templates.temp33_c
// // ]

// // lo(templates).forEach(function(src, name) {
// //     var t = new Stx(src);
// //     try {
// //         t.bh;
// //     } catch(e) {
// //         console.log(e.message ? e.message : e);
// //         console.log(name.underline);
// //     }
// // });

// // var t = new Stx(templates.temp33_c);


// var temp5 = new Stx(function() {/*
// block button {
//     tag: 'button'
//     this.ctx.url {
//         tag: 'a'
//         attrs: {this._bla = '_bla_bla'; console.log(this); return {href: 'hi'};}
//         this._bla, attrs: ({href: this._bla})
//     }
// }
// */});

// temp5.bemhtml.pp();
// temp5.bemhtml.match({block: 'button', url: 'yandex.ru', _bla: 'yandex-team.ru'});


// // /Users/kozin/Documents/bh-migration-test/blocks/link/link.bemhtml
// // arbitrary javascript - sequence of [#stmt ...] wrapped in [#begin ...]
// // can just be wrapped in iif (function () { })()
// // potential problem with 'this' inside the function
// var tt = new Stx(function () {/*
// block link {
//     tag: 'a'
//     attrs: {
//         var ctx = this.ctx,
//             a = {},
//             props = ['title', 'target'], p;

//         while (p = props.pop()) ctx[p] && (a[p] = ctx[p]);
//         ctx.counter && (a.onmousedown = ctx.counter);
//         a.href = ctx.url;

//         return a;
//     }
// }
// */});



// var s = 'module.exports = function(bh) {' +
//         '    bh.match("link", function (ctx, json) {' +
//         '        ctx.tag("a",true);' +
//         '        ctx.attrs((function(){' +
//         '            var _$5ctx = json,' +
//         '                _$5a = {},' +
//         '                _$5props = ["title","target"],' +
//         '                _$5p;' +
//         '            while((_$5p = _$5props.pop())) {' +
//         '                (_$5ctx[_$5p] && ((_$5a[_$5p] = _$5ctx[_$5p])))' +
//         '            };' +
//         '            (_$5ctx.counter && ((_$5a.onmousedown = _$5ctx.counter)));' +
//         '            (_$5a.href = _$5ctx.url);' +
//         '            return _$5a' +
//         '        })(),true);' +
//         '    });};';


// var e = 'this.isFirst()';
// var ast = bemparser.matchAll(e, 'stmt');

// pp(ast);


// var z = new Stx(function () {/*
// block z-pseudo {
//     elem icon {
//         attrs: {
//             var url = this.ctx.url;

//             if (url.indexOf('http') !== 0) { url = '//' + url; }
//             return {
//                 style: 'background-image: url(' + url + ');' +
//                        '_background:none;' +
//                        '_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + url + '\', sizingMethod=\'crop\');}'
//             };
//         }
//     }

//     elem content {
//         mix: { block: 'clearfix' }
//     }

//     elem item, this.isLast(), mix: {
//         mods: { pos: 'last' }
//     }
// }
// */});

// z.bh.beautify().pp();


var differ = require('html-differ'),
    difflogger = require('html-differ/lib/diff-logger'),
    options = {
        ignoreHtmlAttrs: [],
        compareHtmlAttrsAsJSON: [],
        ignoreWhitespaces: true,
        ignoreHtmlComments: true,
        bem: false
    };

// var src = '/Users/kozin/Documents/bh-migration-test/blocks/z-weather/__tile/z-weather__tile.bemhtml',
var src = '/Users/kozin/Documents/bh-migration-test/blocks/z-pseudo/z-pseudo.bemhtml',
    granny = new Stx(fs.readFileSync(src, 'utf8')),
    dirname = path.dirname(src),
    name = path.basename(src, '.bemhtml'),
    bemjson = fs.readFileSync(dirname + '/' + name + '.json', 'utf8'),
    json = JSON.parse(bemjson),
    json2 = lo.cloneDeep(json),
    htmlexpected = granny.match(json),
    html = granny.bh.match(json2);

granny.pp(granny.src);
//granny.bh.beautify().pp();
pp(bemjson);
console.log('\n'.black);
var diff = differ.diffHtml(html, htmlexpected);
difflogger.log(diff, { charsAroundDiff: 40 });
