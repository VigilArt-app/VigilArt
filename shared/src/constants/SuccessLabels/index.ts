import { ApiSuccessData } from "../../types";

export const successLabels: Record<ApiSuccessData["statusCode"], ApiSuccessData["message"]> = {
    200: "OK",
    201: "Created",
    204: "No Content"
};
