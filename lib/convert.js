var convert = exports;
var compat = require('bemhtml-compat');

function pp(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function getSource(fn) {
    return fn.toString().replace(/^function\s*\(\)\s*{\/\*|\*\/}$/g, '');
}

convert.simple = {

    // (-> stxsimple astxjst)
    parse: function (src) { return compat.translate(compat.parse (src)); }

};

convert.xjst = {

    // (-> stxjs astxjst)
    parse: function (src) { throw("not implemented");}

};

/**********
 playground
 **********/

var src = getSource(function(){/*

                                block logo {
                                  tag: 'img'
                                }

                                */});

var ast = compat.parse(src);
console.log("Simple bem AST:\n");
pp(ast);

var xast = compat.translate(ast);
console.log("XJST bem AST:\n");
pp(xast);
