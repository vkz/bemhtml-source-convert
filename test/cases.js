// cases/temp11.bemhtml
block button, tag: 'button'

tag: ... -> ctx.tag(...);

// cases/temp12.bemhtml
block button {
    tag: 'button'
    content: 'text'
    this._bla && this._bla === 'bla' { tag: 'a'}
}

content: ...      -> ctx.content()
... this._bla ... -> if(... ctx.tParam('_bla') ...)

// cases/temp21_a.bemhtml
block button {
    tag: 'button'
    this.ctx.url {
        tag: 'a'
        attrs: {href: this.ctx.url}
    }
}

attrs: ... -> ctx.attrs(...)
this.ctx.url -> ctx.param('url') === true

// cases/temp21_b.bemhtml
block button {
    tag: 'button'
    typeof this.ctx.url !== 'undefined' {
        tag: 'a'
        attrs: {href: this.ctx.url}
    }
}

// cases/temp21_c.bemhtml
block button {
    tag: 'button'
    this.ctx.url {
        tag: 'a'
        attrs: {href: this.ctx.url}
        this._bla, attrs: {href: this._bla}
    }
}

// cases/temp22_a.bemhtml
block button {
    this.elem, tag: this.ctx.elem
    this.elem, this.ctx.id, attrs: { id: this.ctx.id  }
}

// cases/temp22_b.bemhtml
block button {
    tag, ~['mark', 'item', 'text'].indexOf(this.elem): 'span'
}

this.elem === 'item' -> 'button__item'

// cases/temp32.bemhtml
block logo {
    tag: 'img'
    this.ctx.url, attrs: ({alt: 'logo', href: this.ctx.url})
}

// cases/temp33_a.bemhtml
block b-inner, default: applyCtx({ block: 'b-wrapper',
                                   content: this.ctx })


// cases/temp33_b.bemhtml
block b1 {
    content: [applyNext(), 'text2']
}

applyNext() -> ctx.applyBase()

// cases/temp33_c.bemhtml
block logo {
    this.ctx.url, tag: 'a'
    attrs {
        lo.isEmpty(this) || true: {role: 'logo'}
        this.ctx.url: {
            var ctx = this.ctx,
            p = applyNext(),
            a = { href: ctx.url };
            return this._.extend(p, a);}
    }
}
