import { applyDecorators, Type, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiSuccessClass, ApiCreatedClass, ApiNoContentClass } from '@vigilart/shared/schemas';

export const ApiResponseGeneric = <DataDto extends Type<unknown>>(
    status: HttpStatus.OK | HttpStatus.CREATED | HttpStatus.NO_CONTENT,
    dataDto?: DataDto | [DataDto]
) => {
    if (status === HttpStatus.NO_CONTENT) {
        return applyDecorators(
            ApiExtraModels(ApiNoContentClass),
            ApiResponse({
                status: HttpStatus.NO_CONTENT,
                schema: {
                    allOf: [
                        { $ref: getSchemaPath(ApiNoContentClass) }
                    ]
                }
            })
        );
    }

    const isArray = Array.isArray(dataDto);
    const actualDto = isArray ? dataDto[0] : dataDto;
    const dataSchema = actualDto
        ? (isArray
            ? { type: 'array', items: { $ref: getSchemaPath(actualDto) } }
            : { $ref: getSchemaPath(actualDto) })
        : { type: 'object', example: {} };
    return applyDecorators(
        actualDto ?
            ApiExtraModels(ApiSuccessClass, ApiCreatedClass, actualDto) :
            ApiExtraModels(ApiSuccessClass, ApiCreatedClass),
        ApiResponse({
            status: status,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(status === HttpStatus.OK ? ApiSuccessClass : ApiCreatedClass) },
                    {
                        properties: {
                            data: dataSchema,
                        },
                    },
                ],
            },
        }),
    );
}