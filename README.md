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
