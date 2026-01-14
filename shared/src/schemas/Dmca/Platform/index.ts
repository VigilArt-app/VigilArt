import { createZodDto } from "nestjs-zod";
import { DmcaPlatformSchema } from "../../../generated/zod";
import { dateTimeStringToDate } from "../../../constants";
import { z } from "zod";

export type DmcaFieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'url'
    | 'email';

export interface DmcaFormField {
    kind: 'field';
    key: string;
    type: DmcaFieldType;
    title: string;
    description?: string;
    required?: boolean;
    placeholder?: string;
}

export interface DmcaFormRepeater {
  kind: 'array';
  key: string;
  title: string;
  description?: string;
  minItems?: number;
  maxItems?: number;
  itemSchema: DmcaFormItem[];
}

export interface DmcaFormGroup {
    kind: 'group';
    title: string;
    description?: string;
    items: DmcaFormItem[];
}

export type DmcaFormItem = DmcaFormField | DmcaFormGroup | DmcaFormRepeater;

export type DmcaFormSchema = DmcaFormItem[];

const fieldSchema = z.object({
    kind: z.literal('field'),
    key: z.string().min(1),
    type: z.enum(['text', 'textarea', 'number', 'url', 'email']),
    title: z.string().min(1),
    description: z.string().optional(),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
});

const createItemSchema = (depth: number): z.ZodType<DmcaFormItem> => {
    if (depth > 3) return z.never();

    const self: z.ZodType<DmcaFormItem> = z.lazy(() => createItemSchema(depth + 1));

    return z.discriminatedUnion('kind', [
        fieldSchema,
        z.object({
            kind: z.literal('group'),
            title: z.string().min(1),
            description: z.string().optional(),
            items: z.array(self),
        }),
        z.object({
            kind: z.literal('array'),
            key: z.string().min(1),
            title: z.string().min(1),
            description: z.string().optional(),
            minItems: z.number().optional(),
            maxItems: z.number().optional(),
            itemSchema: z.array(self),
        })
    ]);
};

const DmcaFormSchemaValidator: z.ZodType<DmcaFormSchema> = z.array(createItemSchema(0));

export const DmcaPlatformGetSchema = DmcaPlatformSchema.extend({
    formSchema: DmcaFormSchemaValidator,
    createdAt: dateTimeStringToDate,
    updatedAt: dateTimeStringToDate
});
export class DmcaPlatformGetDTO extends createZodDto(DmcaPlatformGetSchema) {}

export const DmcaPlatformCreateSchema = DmcaPlatformGetSchema.pick({
    websiteCategory: true,
    slug: true,
    displayName: true,
    domain: true,
    dmcaUrl: true,
    formSchema: true
});
export class DmcaPlatformCreateDTO extends createZodDto(DmcaPlatformCreateSchema) {}

export const DmcaPlatformUpdateSchema = DmcaPlatformGetSchema.pick({
    displayName: true,
    domain: true,
    dmcaUrl: true,
    formSchema: true,
    websiteCategory: true
});
export class DmcaPlatformUpdateDTO extends createZodDto(DmcaPlatformUpdateSchema) {}
