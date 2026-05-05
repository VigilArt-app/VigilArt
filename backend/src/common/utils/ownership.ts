import { ForbiddenException, NotFoundException } from "@nestjs/common";

export function assertResourceOwnership<T extends { userId: string | null }>(
    resource: T | null | undefined,
    userId: string,
    notFoundMessage: string = "Ressource not found.",
    forbiddenMessage: string = "You do not have permission to access this resource."
): T {
    if (!resource)
        throw new NotFoundException(notFoundMessage);
    if (resource.userId !== userId)
        throw new ForbiddenException(forbiddenMessage);
    return resource;
}
