#[BEMHTML] to [BH] conversion tool
###### Disclaimer ######
_Given the impedence mismatch between Bemhtml and Bh it does not seem possible to convert every template or guarantee that the applicative semantics of the source is preserved in the result. Bemhtml is much too expressive and lenient to deliver on such promise. The ability to apply templates in a modified context powered by [xjst] methods **apply**, **applyNext**, **applyCtx** employing the result is one feature prominantly missing in Bh. Its **applyBase** method carries a very particular meaning that doesn't map clearly on Bemhtml machinery and as of this writing appears to be broken anyway._

----------------------------------------------------------------------------------

[bemhtml-source-convert](https://github.com/vkz/bemhtml-source-convert) helps you port existing [Bemhtml] templates to [Bh]. Given the above disclaimer it is best viewed as an assistant that guides your conversion effort. Until there's a more direct mapping between *Bemhtml* and *Bh* we hope that in the best case it will produce a drop in replacement for your *Bemhtml* template, give you enough meat to avoid writing *Bh* from scratch on your average template, and offer meaningful feedback when conversion fails. Be sure to eyeball and test even the happy case when conversion succeeds.

##Install

```shell
$ npm install bemhtml-source-convert
```

##Use

###cli

----------------------------------------------------------------------------------

```shell
$ bemhtml2bh -h
Usage:
  bemhtml2bh [OPTIONS] [ARGS]


Options:
  -h, --help : Help
  -v, --verbose : Verbose mode
  -i INPUT, --input=INPUT : File to convert (default: stdin)
  -j BEMJSON, --json=BEMJSON : Apply templates to this bemjson file
  -s SETOPTIONS, --setOptions=SETOPTIONS : Set bh-template options (default: { "jsAttrName": "onclick" , "jsAttrScheme": "js" })
  -o OUTPUT, --output=OUTPUT : Output to file (default: stdout)
```

####Example
Convert this meaningless _**-i**_ *test/scratch.bemhtml*

```
block node {
    mod 'size' 'big', tag: 'big'
    js: {param: 'p2'}
    attrs:  {node: 'yes'}
}
```

feeding it _**-j**_ *test/scratch.json*

```
{
    "block" : "node",
    "attrs": {"a": "set"}
}
```

Hopefully this should produce a Bh template and HTML. You'll get a color-coded diff if generated Bh and original Bemhtml produce different HTML when applied to the same *bemjson*.

```shell
~/Documents/bemhtml-source-convert [master] $ bemhtml2bh -i test/scratch.bemhtml -j test/scratch.json
module.exports = function (bh) {
    bh.match('node_size_big', function (ctx, json) {
        ctx.tag('big', true);
    });
    bh.match('node', function (ctx, json) {
        ctx.js(json.js !== false ? ctx.extend(json.js, { 'param': 'p2' }) : false);
        ctx.attrs(ctx.extend({ 'node': 'yes' }, ctx.attrs()));
    });
};
Html produced
expected actual
<div a="set" class="i-bem node" data-bem="{&node="yes" onclick="return {&quot;node&quot;:{&quot;param&quot;:&quot;p2&quot;}}" node="yes"></;}}"></div>
```

###api

----------------------------------------------------------------------------------

####Stx {constructor}

#####`var stx = new Stx(stringOfBemhtml)`

#####stx.bemhtml {object}

Has properties:

  * `src` {string} also available as `stx.src`
  * `match(json)` apply template to bemjson. Also available as `stx.match(json)`
  * `pp(options)` pretty-print the template, accepts optional options argument (see `stx.pp` method)

#####stx.bh {object}

Bh-template is generated when you first dereference this object. Has properties:

  * `src` {string}
  * `match(json, options)` apply the template to bemjson. Control global BH defaults by passing optional 2nd argument {json} e.g. `{"jsAttrName": "data-bem" , "jsAttrScheme": "json"}`
  * `pp(options)` pretty-print the template, accepts optional options argument (see `stx.pp` method)

#####stx.htmlDiff(json, options)

Apply each Bemhtml and generated Bh template to json. Optional 2nd argument is the same you'd pass to `bh.match`. Returns an {object} with properties:

  * `isEqual` {boolean} - `true` if both templates produce equivalent HTML
  * `html` {string} - html if `isEqual`, color-coded diff otherwise (ansi colors)

#####stx.pp(anyJavaScriptObject, {prompt: "", stringify: false)

Generic pretty-printer. Accepts optional 2nd argument `{object}` with properties:

  * `prompt` {string} - prompt string e.g. name of the object, will be printed under the header
  * `stringify` {boolean} -  add indentation to the object's string representation but don't wrap it in header and footer

####Example

```javascript
var Stx = require('bemhtml-source-convert').Stx,
    fs = require('fs'),
    stx = new Stx(fs.readFileSync('scratch.bemhtml', 'utf8')),
    bemjson = JSON.parse(fs.readFileSync('scratch.json', 'utf8'));

// pretty-print bemjson
stx.pp(bemjson, {prompt: 'bemjson'});

// pretty-print bemhtml
stx.bemhtml.pp({prompt: 'bemhtml'});

// convert bemhtml into bh and pretty-print the result
try {
    stx.bh.pp({prompt: 'bh generated'});
} catch(e) {
    console.log(e.message);
}

// try applying both templates to bemjson showing colored diff if they
// produce different HTML or HTML otherwise
var diff = stx.htmlDiff(bemjson);
console.log(
    diff.isEqual ? 'Html\n' : 'Html diff\n',
    diff.html);

// write generated bh out
fs.writeFileSync('scratch.bh.js', stx.bh.src);
```

----------------------------------------------

####Contributors
* [Sergey Berezhnoy](https://github.com/veged)

[Bemhtml]:    http://bem.info/tags/bem-core-v2.3.0/#
[Bemhtml/Ru]: http://ru.bem.info/technology/bemhtml/2.3.0/rationale/
[Bh]:         https://github.com/bem/bh
[xjst]:       https://github.com/veged/xjst
