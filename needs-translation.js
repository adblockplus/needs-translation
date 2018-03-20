/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

// needs-translation
//
// Process a set of XLIFF (v1.2) files to produce a single XLIFF (v1.2) file for
// translations.
//
// Compare the base language against all other languages. If a target for an
// item to be translated is missing for another language then output that item
// as needing translation. Exclude an item if it is part of the exclusion model.
//
// Final output goes to stdout.

"use strict";

const compare = require("./lib/compare/compare.js");
const language = require("./model/language-model.js");
const Rx = require("rxjs/Rx");
const xliff = require("./lib/xliff/xliff.js");

const baseToJson = xliff.read(language.base + xliff.ext).shareReplay(1);
Rx.Observable.from(language.targets)
  .flatMap(target =>
  {
    return Rx.Observable.zip(baseToJson,
                             xliff.read(target + xliff.ext));
  })
  .flatMap(zipped =>
  {
    return compare.languageCompare(zipped[0],
                                   zipped[1]);
  })
  .reduce((acc, json) =>
  {
    return Object.assign(acc, json);
  }, {})
  .subscribe(result =>
  {
    xliff.log(result);
  });
