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

const ext = ".xliff";
const fs = require("fs");
const jsToXliff12 = require("xliff/jsToXliff12");
const Rx = require("rxjs/Rx");
const xliff12ToJs = require("xliff/xliff12ToJs");
const xliffEncoding = "utf8";

/**
 * Print XLIFF from JSON.
 * @param {Object} json: Object to convert to XLIFF
 */
function log(json)
{
  jsToXliff12(json, (err, xliff) =>
  {
    console.log(xliff);
  });
}

/**
 * Read in XLIFF and emit JSON.
 * @param {string} filename
 * @returns {Observable<JSON>}
 */
function read(filename)
{
  return new Rx.Observable(observer =>
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

module.exports =
{
  ext,
  log,
  read
};
