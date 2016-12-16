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


## Contributing

Want to contribute to SMW? Great! Here are some guidelines

### Coding style

Trust in `.eslintrc`. Beyond what's explicated there, follow these rules:

- Open/close indentation: For any opening paren/brace/bracket that starts its
  own indentation level, give the closing paren/brace/bracket its own line:

```
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

### Building, deploying, and testing (oh my!)

Use these npm scripts to your advantage:

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
  - `test/**/*-helper*.js`: JasmineJS-style test helpers
