# SMW: Strict Mode for the Web / Show Me Why

Let's face it. We all make mistakes when we code. Best practices on the web
can change so fast that we often don't even know that we failed to *Do the
Right Thing™*.

You know what's good for that? Continuous Integration. But sometimes that's
not enough. Sometimes you've implemented some sweeping change and CI doesn't
catch it until you try to merge it upstream. Sometimes reusing an
anti-pattern slows down your app just a little bit. And then a little bit
more. And then, finally, performance dips below the threshold your CI tools
are checking for. And you get to clean up the mess.

So, what's better than continuous integration? Tools that notify you *the
moment you do something wrong*. And what's even better than that?  Tools that
can explain to you *what you did wrong and how to avoid it in the
future*. **That's SMW**.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [SMW: Strict Mode for the Web / Show Me Why](#smw-strict-mode-for-the-web--show-me-why)
  - [Contributing](#contributing)
    - [Coding style](#coding-style)
    - [Building, deploying, and testing (oh my!)](#building-deploying-and-testing-oh-my)
    - [File names and directory structure](#file-names-and-directory-structure)
  - [Underlying technologies](#underlying-technologies)
    - [Working with FOAM](#working-with-foam)
      - [FOAM and module loading](#foam-and-module-loading)
      - [FOAM Resources](#foam-resources)
        - [FOAM2](#foam2)
        - [FOAM1 and FOAM2](#foam1-and-foam2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Contributing

Want to contribute to SMW? Great! Here are some guidelines.

### Coding style

Trust in `.eslintrc`. Beyond what's explicated there, follow these rules:

- **Open/close indentation**: For any opening paren/brace/bracket that starts
  its own indentation level, give the closing paren/brace/bracket its own
  line:

```js
const foo = {
  bar: 0, baz: 1, quz: 2,
};
let foo = [
  bar, baz, quz,
];
foo(
  bar, baz, quz
);
```

- **File and module loading**: Prefer `require('external-package-name')` and
  `require('../relative/path/to/local/File.es6.js')`. This is often
  accompanied by FOAM dependency declarations. See [FOAM and module
  loading](#foam-and-module-loading) for details.

### Building, deploying, and testing (oh my!)

First source `scripts/dev_env.sh`:

```zsh
. ./scripts/dev_env.sh
```

Now you can safely use these npm scripts to your advantage:

- `npm run develop`: Watch dependencies and continuously rebuild Javascript bundles
- `npm run build`: Build Javascript bundles (one-shot)
- `npm run lint`: As above, but first run the linter
- `npm run unit`: Run NodeJS unit tests
- `npm run integration`: Run NodeJS integration tests
- `npm run test`: Run all NodeJS tests
- `npm run coverage`: Generate a test coverage report (look in `.coverage` directory)

### File names and directory structure

Files that use ECMAScript 2015 (the ECMAScript formerly known as 6) features
should end in `.es6.js`; build rules depend on this pattern. Generated
Javascript bundles (and nothing else) ends in `.bundle.js`.

Directories at a glance:

- `lib`: Code
- `main`: *Program entry point* code
- `static`: Assets that can be served statically
  - `static/bundle`: Bundled/compiled assets (generated via `npm` scripts)
 `scripts`: Shell scripts
- `config`: Toolchain configuration
- `test`: Tests
  - `test/any`: Test code that runs in any environment
  - `test/node`: Test code that runs only in NodeJS
  - `test/browser`: Test code that runs only in the browser
  - `test/**/*-test*.js`: Unit tests
  - `test/**/*-integration*.js`: Integration tests
  - `test/**/*-helper*.js`: Jasmine-style test helpers

## Underlying technologies

SMW uses [Jasmine](https://jasmine.github.io/) for testing,
[Webpack](https://webpack.github.io/) for ECMAScript compatibility and
packaging, and [FOAM](https://github.com/foam-framework) for everything else.

### Working with FOAM

SMW is built using a holistic modeling framework called FOAM. Learning FOAM
itself is beyond the scope of of this README. Some FOAM resources are listed
at the end of this section.

#### FOAM and module loading

SMW uses Webpack for its own code, but not for the FOAM framework
itself. FOAM is loaded in the browser using:

```html
<script language="javascript" src="path/to/foam.js"></script>
```

as in the [Jasmine SpecRunner](static/test/SpecRunner.html##L15).

FOAM is loaded in NodeJS using:

```js
require('foam2-experimental');
```

as in the [Jasmine FOAM Helper](test/node/foam-helper.js#L20).

FOAM injects packaged-named FOAM dependencies into instance contexts, but
does not support automagically loading dependencies
([yet](https://github.com/foam-framework/foam2-experimental/issues/192)). This
means that typical code that requires the SMW dependency
`tools.web.strict.Foo`, and uses it in the context of `tools.web.strict.Bar`
looks something like this:

```js
require('./Foo.es6.js'); // Tell Node/Webpack that we need this file.

foam.CLASS({
  package: 'tools.web.strict',
  name: 'Bar',

  requires: ['tools.web.strict.Foo'], // Tell FOAM we need tools.web.strict.Foo.

  // ...

  methods: [
    function fooBar() {
      let foo = this.Foo.create({/* ... */);

      // ...
    }
  ]

  // ...
});
```

Yes, this is somewhat redundant. The FOAM team is [working on
it](https://github.com/foam-framework/foam2-experimental/issues/192).

#### FOAM Resources

##### FOAM2

- [FOAM2 experimental
  repository](https://github.com/foam-framework/foam2-experimental): SMW
  consumes a branch of this
- [FOAM2 official repository](https://github.com/foam-framework/foam2): All
  the features that have been thoroughly documented and tested
- [FOAMByExample](https://github.com/foam-framework/foam2-experimental/blob/master/test/browser/DAOByExample.js):
  This is an Javascript description of a by-example
  tutorial. (Meant-for-human-consumption version [hopefully coming
  soon](https://github.com/foam-framework/foam2-experimental/issues/193).)

##### FOAM1 and FOAM2

- [YouTube Channel](https://www.youtube.com/channel/UCUmJgdncsCyHO3YAfsk2Kjg)
  for videos about FOAM
- [Slides](http://foam-framework.github.io/foam/foam/index.html?model=foam.demos.empire.Preso)
  and [video](https://www.youtube.com/watch?v=n699DWb2TUs) from talk at
  EmpireJS
- [Slides](http://foam-framework.github.io/foam/foam/index.html?model=foam.demos.empire.Preso3&flags_=swift,java,compiletime)
  and [video](https://www.youtube.com/channel/UCUmJgdncsCyHO3YAfsk2Kjg) from
  talk at Full-Stack Toronto
