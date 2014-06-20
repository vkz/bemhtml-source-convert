var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint;
var assert = require('assert');
var diff = require('html-differ');
var ibem = require('./i-bem');

describe('bemhtml-source-convert/API', function () {

    var template = stx.get(function(){/*
      block b1, tag: 'a'
      block b1, content: {
        local('submode', { x: 1},
              this.p = true, this.z = {}, this.z.d = 'world') {
          this._buf.push('hello ' + this.z.d);
        }
        return apply('subcontent', this.x = '!');
      }
      block b1, subcontent: {
        return this.x;
      }
    */});

    describe('#stx', function () {

        it('should parse old syntax into xjst-ast', function () {
            var template = stx.get(function(){/*
                 block button, tag: 'button'
                */});
            var ast = stx.parse(template);
            assert.equal(JSON.stringify(ast),
                         '[["template",["binop","&&",["binop","&&",["unop","!",'   +
                         '["getp",["string","elem"],["this"]]],["binop","===",'    +
                         '["getp",["string","block"],["this"]],'                   +
                         '["string","button"]]],["binop","===",["getp",["string",' +
                         '"_mode"],["this"]],["string","tag"]]],["begin",'         +
                         '["return",["string","button"]]]]]' );

        });

        it('should compile old syntax into js-syntax', function () {
            var re = /(match\((function.*)+\)\(.*\);)+/i;
            assert(!!stx.tojs(template).match(re) === true);
        });

        it('should match bemjson against old syntax to produce html', function () {
            assert.equal(stx.tohtml(template)({ block: 'b1' }),
                         '<a class="b1">hello world!</a>');
        });


        it('should convert old syntax into bh', function () {
            assert.fail();
        });


    });

    describe('#stxjs', function () {
        it('should match bemjson against js-syntax to produce html', function () {
            assert.equal(stxjs.tohtml(stx.tojs(template))({ block: 'b1' }),
                         '<a class="b1">hello world!</a>');
        });

    });

    describe('#bh', function () {

    });



});
