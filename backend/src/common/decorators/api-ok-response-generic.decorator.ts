import { applyDecorators, Type, HttpStatus } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import {
  ApiSuccessDTO,
  ApiCreatedDTO,
  ApiNoContentDTO
} from "@vigilart/shared/schemas";

export const ApiResponseGeneric = <DataDto extends Type<unknown>>(
    status: HttpStatus.OK | HttpStatus.CREATED | HttpStatus.NO_CONTENT,
    dataDto?: DataDto | [DataDto],
    nullable?: boolean
) => {
  if (status === HttpStatus.NO_CONTENT) {
    return applyDecorators(
      ApiExtraModels(ApiNoContentDTO),
      ApiResponse({
        status: HttpStatus.NO_CONTENT,
        schema: {
          allOf: [{ $ref: getSchemaPath(ApiNoContentDTO) }]
        }
      })
    );
  }

    const isArray = Array.isArray(dataDto);
    const actualDTO = isArray ? dataDto[0] : dataDto;
    const baseDataSchema = actualDTO
        ? (isArray
            ? { type: 'array', items: { $ref: getSchemaPath(actualDTO) } }
            : { $ref: getSchemaPath(actualDTO) })
        : { type: 'object', example: {} };
    const dataSchema = nullable && actualDTO
        ? {
            oneOf: [
                baseDataSchema,
                { type: 'null' }
            ]
        }
        : baseDataSchema;

    return applyDecorators(
        actualDTO ?
            ApiExtraModels(ApiSuccessDTO, ApiCreatedDTO, actualDTO) :
            ApiExtraModels(ApiSuccessDTO, ApiCreatedDTO),
        ApiResponse({
            status: status,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(status === HttpStatus.OK ? ApiSuccessDTO : ApiCreatedDTO) },
                    {
                        properties: {
                            data: dataSchema,
                        },
                    }
                ],
            },
        }),
    );
}