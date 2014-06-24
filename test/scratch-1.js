var convert = require('..'),
    stx = convert.stx,
    stxjs = convert.stxjs,
    bh = convert.bh,
    pp = convert.prettyPrint,
    assert = require('assert'),
    diff = require('html-differ'),
    ibem = require('./i-bem');

/**********
 playground
 **********/
var temp = stx.get(function(){/*

    block logo {

    !this.elem, content: [
        {
            elem: 'link',
            url: this.ctx.url,
            content: {
                elem: 'image',
                alt: this.ctx.alt,
                url: this.ctx.image
            }
        },
        this.ctx.content
    ]

    elem link {
        tag: 'a'
        attrs: { href: this.ctx.url }
    }

    elem image {
        tag: 'img'
        attrs: {
            alt: this.ctx.alt || '',
            src: this.ctx.url
        }
    }
}
*/});


//console.log(bh.tohtml(tempbh1)({block: 'logo'}));
console.log(stx.tohtml (temp)({
    block: "logo",
    content:     {
        elem: 'link',
        url: 'yandex.ru'
    }
}));

console.log(stx.tohtml (temp)({
    block: "logo"
}));


// Source: examples near the bottom of the page in
// http://ru.bem.info/libs/bem-core/2.2.0/templating/bemhtml-js-syntax
