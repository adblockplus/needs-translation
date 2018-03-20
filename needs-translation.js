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

const fs = require("fs");
const Rx = require("rxjs/Rx");
const xliff12ToJs = require("xliff/xliff12ToJs");
const language = require("./model/language-model.js");
const exclusions = require("./model/exclusion-model.js");
const xliffExt = ".xliff";
const xliffEncoding = "utf8";

/**
 * @returns {Object} Empty JSON result dictionary
 */
function makeNewJSON()
{
  return {
    resources: {},
    sourceLanguage: language.base,
    targetLanguage: ""
  };
}

/**
 * Print XLIFF from JSON.
 * @param {Object} json: Object to convert to XLIFF
 */
function printXliff(json)
{
  const js2xliff = require("xliff/js2xliff");
  js2xliff(json, (err, xliff) =>
  {
    console.log(xliff);
  });
}

/**
 * Read in XLIFF and emit JSON.
 * @param {string} filename
 * @returns {Observable<JSON>}
 */
function xliffRead(filename)
{
  return new Rx.Observable((observer) =>
  {
    fs.readFile(filename, xliffEncoding, (fileErr, data) =>
    {
      if (fileErr)
      {
        observer.error(fileErr);
      }
      xliff12ToJs(data, (xliffErr, json) =>
      {
        if (xliffErr)
        {
          observer.error(xliffErr);
        }
        observer.next(json);
        observer.complete();
      });
    });
  });
}

const baseToJson = xliffRead(language.base + xliffExt).shareReplay(1);

/**
 * Compare a target language to the base language.
 * @param {Object} baseJSON
 * @param {Object} targetJSON
 * @returns {Observable<JSON>}
 */
function compareLanguage(baseJSON,
                         targetJSON)
{
  return new Rx.Observable((observer) =>
  {
    const resourcesKey = "resources";
    const sourceKey = "source";
    const targetKey = "target";
    let newJSON = makeNewJSON();
    let resources = baseJSON[resourcesKey];
    for (let key in resources)
    {
      newJSON[resourcesKey][key] = {};
      let fileItems = resources[key];
      for (let itemKey in fileItems)
      {
        let source = fileItems[itemKey][sourceKey];
        if (!exclusions.isExcluded(source))
        {
          let otherLangTarget =
            targetJSON[resourcesKey][key][itemKey][targetKey];
          if (otherLangTarget == "")
          {
            newJSON[resourcesKey][key][itemKey] = fileItems[itemKey];
          }
        }
      }
    }
    observer.next(newJSON);
    observer.complete();
  });
}

Rx.Observable.from(language.targets)
  .flatMap(target =>
  {
    return Rx.Observable.zip(baseToJson,
                             xliffRead(target + xliffExt));
  })
  .flatMap(zipped =>
  {
    return compareLanguage(zipped[0],
                           zipped[1]);
  })
  .reduce((acc, json) =>
  {
    return Object.assign(acc, json);
  }, {})
  .subscribe(result =>
  {
    printXliff(result);
  });
