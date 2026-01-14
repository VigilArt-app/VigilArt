import { z } from "zod";
import {
    DmcaPlatformGetSchema,
    DmcaPlatformCreateSchema,
    DmcaPlatformUpdateSchema,
    DmcaFormField,
    DmcaFormGroup,
    DmcaFormRepeater,
    DmcaFormItem
} from "../../../schemas/Dmca/Platform";

export type DmcaPlatformGet = z.infer<typeof DmcaPlatformGetSchema>;
export type DmcaPlatformCreate = z.infer<typeof DmcaPlatformCreateSchema>;
export type DmcaPlatformUpdate = z.infer<typeof DmcaPlatformUpdateSchema>;

export type {
    DmcaFieldType,
    DmcaFormField,
    DmcaFormGroup,
    DmcaFormItem,
    DmcaFormSchema
} from "../../../schemas/Dmca/Platform";

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type MapFieldType<T extends string> =
    T extends "number" ? number : string;

type InferItem<T> = T extends DmcaFormField
    ? (
        T extends { required: true }
            ? { [K in T["key"] & string]: MapFieldType<T["type"]> }
            : { [K in T["key"] & string]?: MapFieldType<T["type"]> }
        )
    : T extends DmcaFormGroup
        ? { [K in T["key"] & string]: GetFormSchemas<T["items"]> }
        : T extends DmcaFormRepeater
            ? { [K in T["key"] & string]: Array<GetFormSchemas<T["itemSchema"]>> }
            : never;

type GetFormSchemas<T extends ReadonlyArray<DmcaFormItem>> = Prettify<
    UnionToIntersection<
        InferItem<T[number]>
    >
>;

export type InferPlatformPayload<T extends DmcaPlatformCreate> = GetFormSchemas<T["formSchema"]>;
