import { SetMetadata } from "@nestjs/common";

export const OWNERSHIP_PARAM_KEY = "ownership_param";

export interface Ownerships {
    data: string;
    userField: "id" | "email";
    type: "body" | "params" | "query";
}

export const CheckOwnership = (paramNames: Ownerships[]) =>
  SetMetadata(OWNERSHIP_PARAM_KEY, Array.isArray(paramNames) ? paramNames : [paramNames]);
