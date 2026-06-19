/* 
  Taken from joi-extract-type
  https://github.com/TCMiranda/joi-extract-type/issues/22#issuecomment-716122472
  https://gist.github.com/panzelva/b0e565870c950c4cfd77188d69a3064a

  Allows extracting a typescript type from a joi schema

  E.g 
  type ServerConfiguration = NonNullable<Joi.extractType<typeof configSchema>>
*/

import joi from "joi";

declare module "joi" {
  interface Root {
    extend(...extensions: Array<joi.Extension | joi.ExtensionFactory>): this;

    any<T>(): BoxAnySchema<Box<T, false>>;

    string<T extends string>(): BoxStringSchema<Box<T, false>>;

    number<T extends number>(): BoxNumberSchema<Box<T, false>>;

    boolean<T extends boolean>(): BoxBooleanSchema<Box<T, false>>;
    bool<T extends boolean>(): BoxBooleanSchema<Box<T, false>>;

    date<T extends Date>(): BoxDateSchema<Box<T, false>>;

    func<T extends Function>(): BoxFunctionSchema<Box<T, false>>;

    array(): BoxArraySchema<Box<never, false>>;

    object<T extends mappedSchemaMap>(
      schema?: T
    ): BoxObjectSchema<Box<extractMap<T>, false>>;

    alternatives<T extends mappedSchema[]>(
      ...alts: T
    ): BoxAlternativesSchema<
      Box<Exclude<extractType<typeof alts[number]>, undefined>, false>
    >;

    alternatives<T extends mappedSchema[]>(
      alts: T
    ): BoxAlternativesSchema<
      Box<Exclude<extractType<typeof alts[number]>, undefined>, false>
    >;

    alt<T extends mappedSchema[]>(
      ...alts: T
    ): BoxAlternativesSchema<Box<extractType<typeof alts[number]>, false>>;

    alt<T extends mappedSchema[]>(
      alts: T
    ): BoxAlternativesSchema<Box<extractType<typeof alts[number]>, false>>;
  }

  /**
   * Field requirements interface
   */
  interface Box<T, R extends boolean> {
    /** Type the schema holds */
    T: T;
    /** If this attribute is required when inside an object */
    R: R;
  }

  // Operators
  type BoxType<B extends BoxSchema, nT> = Box<nT, B["R"]>;
  type BoxUnion<B extends BoxSchema, nT> = Box<B["T"] | nT, B["R"]>;
  type BoxIntersection<B extends BoxSchema, nT> = Box<B["T"] & nT, B["R"]>;
  type BoxReq<B extends BoxSchema, nR extends boolean> = Box<B["T"], nR>;
  type BoxSchema = Box<any, boolean>;

  type primitiveType =
    | string
    | number
    | boolean
    | Function
    | Date
    | undefined
    | null
    | void;
  type mappedSchema = joi.SchemaLike | BoxedPrimitive;
  type mappedSchemaMap = { [K: string]: mappedSchema };
  type extendsGuard<T, S> = S extends T ? S : T;

  /**
   * Every Schema that implements the Box to allow the extraction
   */
  type BoxedPrimitive<T extends BoxSchema = any> =
    | BoxAnySchema<T>
    | BoxStringSchema<T>
    | BoxNumberSchema<T>
    | BoxBooleanSchema<T>
    | BoxDateSchema<T>
    | BoxFunctionSchema<T>
    | BoxArraySchema<T>
    | BoxObjectSchema<T>
    | BoxAlternativesSchema<T>;

  interface BoxAnySchema<N extends Box<any, boolean>> extends joi.AnySchema {
    __schemaTypeLiteral: "BoxAnySchema";

    default(value: any, description?: string): BoxAnySchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxAnySchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxAnySchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    valid<T>(...values: T[]): BoxAnySchema<BoxType<N, T>>;
    valid<T>(values: T[]): BoxAnySchema<BoxType<N, T>>;
    valid(...values: any[]): this;
    valid(values: any[]): this;

    required(): BoxAnySchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxAnySchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxAnySchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxStringSchema<N extends BoxSchema> extends joi.StringSchema {
    __schemaTypeLiteral: "BoxStringSchema";

    default(
      value: string,
      description?: string
    ): BoxStringSchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxStringSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxStringSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    valid<T extends string>(...values: T[]): BoxStringSchema<BoxType<N, T>>;
    valid<T extends string>(values: T[]): BoxStringSchema<BoxType<N, T>>;
    valid(...values: any[]): this;
    valid(values: any[]): this;

    required(): BoxStringSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxStringSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxStringSchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxNumberSchema<N extends BoxSchema> extends joi.NumberSchema {
    __schemaTypeLiteral: "BoxNumberSchema";

    default(
      value: number,
      description?: string
    ): BoxNumberSchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxNumberSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxNumberSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    valid<T extends string>(...values: T[]): BoxNumberSchema<BoxType<N, T>>;
    valid<T extends string>(values: T[]): BoxNumberSchema<BoxType<N, T>>;
    valid(...values: any[]): this;
    valid(values: any[]): this;

    required(): BoxNumberSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxNumberSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxNumberSchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxBooleanSchema<N extends BoxSchema> extends joi.BooleanSchema {
    __schemaTypeLiteral: "BoxBooleanSchema";

    default(
      value: boolean,
      description?: string
    ): BoxBooleanSchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxBooleanSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxBooleanSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    valid<T extends string>(...values: T[]): BoxBooleanSchema<BoxType<N, T>>;
    valid<T extends string>(values: T[]): BoxBooleanSchema<BoxType<N, T>>;
    valid(...values: any[]): this;
    valid(values: any[]): this;

    required(): BoxBooleanSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxBooleanSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxBooleanSchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxDateSchema<N extends BoxSchema> extends joi.DateSchema {
    __schemaTypeLiteral: "BoxDateSchema";

    default(value: Date, description?: string): BoxDateSchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxDateSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxDateSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    valid<T extends string>(...values: T[]): BoxDateSchema<BoxType<N, T>>;
    valid<T extends string>(values: T[]): BoxDateSchema<BoxType<N, T>>;
    valid(...values: any[]): this;
    valid(values: any[]): this;

    required(): BoxDateSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxDateSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxDateSchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxFunctionSchema<N extends BoxSchema> extends joi.FunctionSchema {
    __schemaTypeLiteral: "BoxFunctionSchema";

    allow<T>(...values: T[]): BoxFunctionSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxFunctionSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    required(): BoxFunctionSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxFunctionSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxFunctionSchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxArraySchema<N extends BoxSchema> extends joi.ArraySchema {
    __schemaTypeLiteral: "BoxArraySchema";

    default(
      value: N["T"][],
      description?: string
    ): BoxArraySchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxArraySchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxArraySchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    items<T extends mappedSchema>(
      type: T
    ): BoxArraySchema<BoxUnion<N, extractType<T>>>;

    items(...types: joi.SchemaLike[]): this;
    items(types: joi.SchemaLike[]): this;

    required(): BoxArraySchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxArraySchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxArraySchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxObjectSchema<N extends BoxSchema> extends joi.ObjectSchema {
    __schemaTypeLiteral: "BoxObjectSchema";

    default(
      value: N["T"],
      description?: string
    ): BoxObjectSchema<BoxReq<N, true>>;
    /** @deprecated */
    default(): this;

    allow<T>(...values: T[]): BoxObjectSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxObjectSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    keys<T extends mappedSchemaMap>(
      schema: T
    ): BoxObjectSchema<BoxIntersection<N, extractMap<T>>>;
    keys(schema?: joi.SchemaMap): this;

    append<T extends mappedSchemaMap>(
      schema: T
    ): BoxObjectSchema<BoxIntersection<N, extractMap<T>>>;
    append(schema?: joi.SchemaMap): this;

    pattern<S extends BoxStringSchema<any>, T extends mappedSchema>(
      pattern: S,
      schema: T
    ): BoxObjectSchema<
      BoxIntersection<N, extractMap<{ [key in extractType<S>]: T }>>
    >;

    pattern<T extends mappedSchema>(
      pattern: RegExp,
      schema: T
    ): BoxObjectSchema<BoxIntersection<N, extractMap<{ [key: string]: T }>>>;

    pattern(pattern: RegExp | joi.SchemaLike, schema: joi.SchemaLike): this;

    required(): BoxObjectSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxObjectSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxObjectSchema<BoxReq<N, false>>;
    optional(): this;
  }

  interface BoxAlternativesSchema<N extends BoxSchema>
    extends joi.AlternativesSchema {
    __schemaTypeLiteral: "BoxAlternativesSchema";

    allow<T>(...values: T[]): BoxAlternativesSchema<BoxUnion<N, T>>;
    allow<T>(values: T[]): BoxAlternativesSchema<BoxUnion<N, T>>;
    allow(...values: any[]): this;
    allow(values: any[]): this;

    try<T extends mappedSchema[]>(
      ...values: T
    ): N extends Box<infer oT, infer oR>
      ? BoxAlternativesSchema<BoxType<N, oT | extractType<T>>>
      : BoxAlternativesSchema<Box<extractType<T>, false>>;

    try<T extends mappedSchema[]>(
      values: T
    ): N extends Box<infer oT, infer oR>
      ? BoxAlternativesSchema<BoxType<N, oT | extractType<T>>>
      : BoxAlternativesSchema<Box<extractType<T>, false>>;

    try(...types: joi.SchemaLike[]): this;
    try(types: joi.SchemaLike[]): this;

    required(): BoxAlternativesSchema<BoxReq<N, true>>;
    required(): this;
    exist(): BoxAlternativesSchema<BoxReq<N, true>>;
    exist(): this;
    optional(): BoxAlternativesSchema<BoxReq<N, false>>;
    optional(): this;

    when<
      R,
      T1 extends mappedSchema,
      T2 extends mappedSchema,
      T extends { then: T1; otherwise: T2 }
    >(
      ref: R,
      defs: T
    ): N extends Box<infer oT, infer oR>
      ? BoxAlternativesSchema<
          BoxType<N, oT | extractType<T["then"]> | extractType<T["otherwise"]>>
        >
      : BoxAlternativesSchema<
          Box<extractType<T["then"]> | extractType<T["otherwise"]>, false>
        >;

    when(ref: string | joi.Reference, options: joi.WhenOptions): this;
    when(ref: joi.Schema, options: joi.WhenSchemaOptions): this;
  }

  type maybeExtractBox<T> = T extends Box<infer O, infer R>
    ? R extends true
      ? O
      : O | undefined
    : T;

  type Required<T, K = keyof T> = {
    [j in K extends keyof T
      ? T[K] extends BoxedPrimitive<infer B>
        ? B["R"] extends true
          ? K
          : never
        : never
      : never]: true;
  };

  type Optional<T, K = keyof T> = {
    [j in K extends keyof T
      ? T[K] extends BoxedPrimitive<infer B>
        ? B["R"] extends false
          ? K
          : never
        : never
      : never]: true;
  };

  type extractMap<T extends mappedSchemaMap> = {
    [K in keyof Optional<T>]?: extractType<T[K]>;
  } &
    {
      [K in keyof Required<T>]: extractType<T[K]>;
    };

  type extractOne<T extends mappedSchema> =
    /** Primitive types */
    T extends primitiveType
      ? T
      : /** Holds the extracted type */
      T extends BoxAnySchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxBooleanSchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxStringSchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxNumberSchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxDateSchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxFunctionSchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxArraySchema<infer O>
      ? maybeExtractBox<O>[]
      : T extends BoxObjectSchema<infer O>
      ? maybeExtractBox<O>
      : T extends BoxAlternativesSchema<infer O>
      ? maybeExtractBox<O>
      : T extends joi.AnySchema
      ? any
      : any;

  type extractType<T extends mappedSchema> =
    /**
     * Hack to support [Schema1, Schema2, ...N] alternatives notation
     * Can't use extractType directly here because of cycles:
     * ```
     * T extends Array<infer O> ? extractType<O> :
     *                            ^ cycle
     * ```
     */
    T extends Array<infer O>
      ? O extends joi.SchemaLike
        ? extractOne<O>
        : O extends BoxedPrimitive
        ? extractOne<O>
        : O
      : /**
       * Handle Objects as schemas, without Joi.object at the root.
       * It needs to come first than mappedSchema.
       * It is difficult to avoid it to be inferred from extends clause.
       */
      T extends mappedSchemaMap
      ? extractMap<T>
      : /**
       * This is the base case for every schema implemented
       */
      T extends joi.SchemaLike
      ? extractOne<T>
      : T extends BoxedPrimitive
      ? extractOne<T>
      : /**
         * Default case to handle primitives and schemas
         */
        extractOne<T>;
}
