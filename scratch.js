var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint;
var assert = require('assert');
var diff = require('html-differ');
var ibem = require('./test/i-bem');

/**********
 playground
 **********/

var temp = stx.get(function () {/*

    block('button')(
        def()(function() {
            var mods = this.mods;
            applyNext({ _button : this.ctx });
        }),

        tag()(function() {
            return this.ctx.tag || 'button';
        }),

        js()(true),


        mix()([{ elem : 'control' }]),

        attrs()(

            function() {
                var ctx = this.ctx,
                    attrs = { role : 'button' };

                ctx.tabIndex && (attrs.tabindex = ctx.tabIndex);

                return attrs;
            },


            match(function() { return !this.mods.type })(function() {
                var ctx = this.ctx,
                    attrs = {};

                ctx.tag || (attrs.type = ctx.type || 'button');

                ctx.name && (attrs.name = ctx.name);
                ctx.val && (attrs.value = ctx.val);
                this.mods.disabled && (attrs.disabled = 'disabled');

                return this._.extend(applyNext(), attrs);
            })
        ),

        content()(
            function() {
                var ctx = this.ctx, content = [this.ctx.icon];

                ctx.text && content.push({ elem : 'text', content : ctx.text });
                return content;
            },
            match(function() { return typeof this.ctx.content !== 'undefined' })(function() {
                return this.ctx.content;
            })
        )
    );

                       */});

var tempbh = (function(bh) {

    bh.match('button', function(ctx, json) {
        ctx.tParam('_button', json);

        ctx.js(true);

        ctx.attr('role', 'button').mix({ elem : 'control' });

        json.tabIndex && ctx.attr('tabindex', json.tabIndex);

        // Attributes for button variant
        if(!ctx.mod('type')) {
            json.tag || ctx.attr('type', json.type || 'button');
            json.name && ctx.attr('name', json.name);
            json.val && ctx.attr('value', json.val);
            ctx.mod('disabled') && ctx.attr('disabled', 'disabled');
        }

        ctx.tag(json.tag || 'button');

        var content = ctx.content();
        if(typeof content === 'undefined') {
            content = [json.icon];
            json.text && content.push({ elem : 'text', content : json.text });
            ctx.content(content);
        }
    });

    return bh;

}) (bh.create ());

diff.isEqual(bh.tohtml(tempbh)({block: 'button'}),
             stx.tohtml (temp) ({block: 'button'}));


console.log(bh.tohtml(tempbh)({block: 'button'}));
console.log(stx.tohtml (temp) ({block: 'button'}));
