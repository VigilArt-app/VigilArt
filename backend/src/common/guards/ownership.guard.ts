import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { OWNERSHIP_PARAM_KEY, Ownerships } from "../decorators/check-ownership.decorator";
import { AuthenticatedRequest } from "../../auth/auth";
import { JsonValue } from "@vigilart/shared";

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramNames = this.reflector.get<Ownerships[]>(
      OWNERSHIP_PARAM_KEY,
      context.getHandler()
    );
    if (!paramNames || paramNames.length === 0)
      return true;

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const authenticatedUser = request?.user;

    if (!authenticatedUser)
      throw new UnauthorizedException("User is not authenticated");
    for (const param of paramNames) {
      const authenticatedUserParam = authenticatedUser[param.userField];
      if (!authenticatedUserParam)
        throw new UnauthorizedException("User is not authenticated");

      const resourceOwnerIds = this.resolveDataPath(request[param.type], param.data);
      console.log(resourceOwnerIds);
      if (!resourceOwnerIds.length)
        throw new ForbiddenException(`'${param.data}' not found in ${param.type}`);
      if (!resourceOwnerIds.every(id => id === authenticatedUserParam))
        throw new ForbiddenException("You do not have permission to access this resource");
    }
    return true;
  }

  private resolveDataPath(source?: JsonValue, path?: string): string[] {
    if (!source || !path)
      return [];

    const arrayAllPattern = /\[\]/g;
    const arrayIndexPattern = /\[(\d+)\]/g;
    if (arrayAllPattern.test(path) || arrayIndexPattern.test(path))
      return this.resolveArrayPath(source, path);

    const keys = path.split('.');
    let current: JsonValue = source;

    for (const key of keys) {
      if (!current || typeof current !== "object" || Array.isArray(current))
        return [];
      current = current[key];
    }
    if (typeof current !== "string")
      throw new ForbiddenException(`Invalid ownership path '${path}'.`);
    return [current];
  }

  private resolveArrayPath(source: JsonValue, path: string): string[] {
    const segments = path.split('.');
    let current: JsonValue = source;

    for (const segment of segments) {
      if (!current)
        return [];

      const allItemsMatch = segment.match(/^(.+)?\[\]$/);
      const indexMatch = segment.match(/^(.+)?\[(\d+)\]$/);

      if (allItemsMatch) {
        const fieldName = allItemsMatch[1];

        if (typeof current !== "object" || Array.isArray(current))
          return [];
        if (fieldName)
          current = current[fieldName];
        if (!Array.isArray(current))
          return [];

        const remainingPath = segments.slice(segments.indexOf(segment) + 1).join('.');
        if (remainingPath)
          return current.flatMap(item => this.resolveDataPath(item, remainingPath));

        if (current.every((item): item is string => typeof item === "string"))
          return current;
        throw new ForbiddenException(`Invalid ownership path '${path}'.`);
      } else if (indexMatch) {
        const fieldName = indexMatch[1];
        const index = parseInt(indexMatch[2], 10);

        if (fieldName) {
          if (typeof current !== "object" || Array.isArray(current))
            return [];
          current = current[fieldName];
        }
        if (!Array.isArray(current) || current.length <= index)
          throw new ForbiddenException(`Invalid ownership path '${path}'.`);
        current = current[index];
      } else {
        if (typeof current !== "object" || Array.isArray(current))
          return [];
        current = current[segment];
      }
    }
    if (typeof current === "string")
      return [current];
    if (Array.isArray(current) && current.every((item): item is string => typeof item === "string"))
      return current;
    throw new ForbiddenException(`Invalid ownership path '${path}'.`);
  }
}