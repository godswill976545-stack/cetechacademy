/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_actions from "../auth/actions.js";
import type * as auth_mutations from "../auth/mutations.js";
import type * as auth_queries from "../auth/queries.js";
import type * as courses_queries from "../courses/queries.js";
import type * as email from "../email.js";
import type * as enrollments_mutations from "../enrollments/mutations.js";
import type * as enrollments_queries from "../enrollments/queries.js";
import type * as http from "../http.js";
import type * as progress_mutations from "../progress/mutations.js";
import type * as progress_queries from "../progress/queries.js";
import type * as structure_seed from "../structure/seed.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "auth/actions": typeof auth_actions;
  "auth/mutations": typeof auth_mutations;
  "auth/queries": typeof auth_queries;
  "courses/queries": typeof courses_queries;
  email: typeof email;
  "enrollments/mutations": typeof enrollments_mutations;
  "enrollments/queries": typeof enrollments_queries;
  http: typeof http;
  "progress/mutations": typeof progress_mutations;
  "progress/queries": typeof progress_queries;
  "structure/seed": typeof structure_seed;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
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
