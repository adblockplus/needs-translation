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

"use strict";

const exclusions = require("../../model/exclusion-model.js");
const language = require("../../model/language-model.js");
const Rx = require("rxjs/Rx");

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
 * Compare a target language to the base language.
 * @param {Object} baseJSON
 * @param {Object} targetJSON
 * @returns {Observable<JSON>}
 */
function languageCompare(baseJSON,
                         targetJSON)
{
  return new Rx.Observable(observer =>
  {
    const resourcesKey = "resources";
    const sourceKey = "source";
    const targetKey = "target";
    let newJSON = makeNewJSON();
    let resources = baseJSON[resourcesKey];
    for (let fileKey in resources)
    {
      newJSON[resourcesKey][fileKey] = {};
      let transUnits = resources[fileKey];
      for (let unitKey in transUnits)
      {
        let source = transUnits[unitKey][sourceKey];
        if (!exclusions.isExcluded(source) &&
            targetJSON[resourcesKey][fileKey][unitKey][targetKey] == "")
        {
          newJSON[resourcesKey][fileKey][unitKey] = transUnits[unitKey];
        }
      }
    }
    observer.next(newJSON);
    observer.complete();
  });
}

module.exports =
{
  languageCompare
};

