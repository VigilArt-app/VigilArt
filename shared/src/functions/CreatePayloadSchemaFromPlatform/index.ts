import { DmcaFormSchema, DmcaFormItem } from "../../types";
import { z } from "zod";

export const mapPlatformItemToZod = (item: DmcaFormItem): z.ZodType<unknown> => {
    switch (item.kind) {
        case "field": {
            switch (item.type) {
                case "email": {
                    return item.required
                        ? z.email().min(1, { message: `${item.title} is required` })
                        : z.email().optional().or(z.literal(""));
                }
                case "url": {
                    return item.required
                        ? z.url().min(1, { message: `${item.title} is required` })
                        : z.url().optional().or(z.literal(""));
                }
                case "number": {
                    return item.required
                        ? z.coerce.number()
                        : z.coerce.number().optional();
                }
                case "textarea":
                case "text":
                default: {
                    return item.required
                        ? z.string().min(1, { message: `${item.title} is required` })
                        : z.string().optional().or(z.literal(""));
                }
            }
        }
        case "group": {
            const shape: Record<string, unknown> = {};

            item.items.forEach((child) => {
                shape[child.key] = mapPlatformItemToZod(child);
            });
            return z.object(shape);
        }
        case "array": {
            const itemShape: Record<string, unknown> = {};
            const schemaItems = Array.isArray(item.itemSchema)
                ? item.itemSchema
                : [item.itemSchema];
            schemaItems.forEach((child) => {
                itemShape[child.key] = mapPlatformItemToZod(child);
            });
            const rowSchema = z.object(itemShape);

            return z.array(rowSchema)
                .min(item.minItems || 0)
                .max(item.maxItems || 999);
        }
        default:
            return z.any();
    }
};

export const createPayloadSchemaFromPlatform = (formSchema: DmcaFormSchema): z.ZodType<unknown> => {
    const shape: Record<string, unknown> = {};

    formSchema.forEach((item) => {
        shape[item.key] = mapPlatformItemToZod(item);
    });
    return z.object(shape);
};
