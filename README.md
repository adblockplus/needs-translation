# needs-translation

A configurable translations diff and exclusion tool for XLIFF 1.2. Designed for Xcode exports for
localization. Implemented with Node and [RxJS](https://github.com/Reactive-Extensions/RxJS).

## Summary

* Compares unlimited target languages to a base language
* Excludes translations of items that are already completely translated
* Excludes items that are not to be translated based on string matching

This is a tool to print only items needing translation from all localizable strings in a project.
It makes sure that translations will exist for every language and it ignores strings that have
already been translated. It also allows custom configuration of source strings that should be
completely ignored.

## Usage

After cloning the repository, configure `language-model.js` and `exclusion.model.js` according to
your needs. Then run the following commands where `$YOUR_XLIFF_PATH` contains your source XLIFF
files for all languages to be compared.

    $ npm install
    $ cp {$YOUR_XLIFF_PATH}/*.xliff .
    $ node needs-translation.js

Output is to stdout.
