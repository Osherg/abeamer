"use strict";
// uuid: 53d3fa61-626c-465a-a903-99878ed240d8

// ------------------------------------------------------------------------
// Copyright (c) 2018 Alexandre Bento Freire. All rights reserved.
// Licensed under the MIT License+uuid License. See License.txt for details
// ------------------------------------------------------------------------

// Defines global constants



// This file was generated via gulp build-shared-lib
// It shares the uuid
//
// @WARN: Don't edit this file.
/** @see client/lib/js/consts.ts */

/** @module internal | This module is to be read only by developers */

/**
 * ## Description
 *
 * Defines global constants.
 *
 * This module will generate a node module,
 * therefore it can't contain external references.
 */
export namespace Consts {

  // ------------------------------------------------------------------------
  //                               Logging Type
  // ------------------------------------------------------------------------

  export const LT_MSG = 0;
  export const LT_WARN = 1;
  export const LT_ERROR = 2;

  // ------------------------------------------------------------------------
  //                               Logging Level
  // ------------------------------------------------------------------------

  export const LL_SILENT = 0;
  export const LL_ERROR = 1;
  export const LL_WARN = 2;
  export const LL_VERBOSE = 3;

  // ------------------------------------------------------------------------
  //                               Args Stage
  // ------------------------------------------------------------------------

  export const AS_UNKNOWN = 0;
  export const AS_ADD_ANIMATION = 1;
  export const AS_RENDERING = 2;
  export const AS_STORY = 3;
}
