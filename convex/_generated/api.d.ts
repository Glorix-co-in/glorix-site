/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminContent from "../adminContent.js";
import type * as content from "../content.js";
import type * as lib_admin from "../lib/admin.js";
import type * as publishing from "../publishing.js";
import type * as seed from "../seed.js";
import type * as seedData_events from "../seedData/events.js";
import type * as seedData_index from "../seedData/index.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminContent: typeof adminContent;
  content: typeof content;
  "lib/admin": typeof lib_admin;
  publishing: typeof publishing;
  seed: typeof seed;
  "seedData/events": typeof seedData_events;
  "seedData/index": typeof seedData_index;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
