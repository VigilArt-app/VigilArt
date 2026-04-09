export type JsonObject = {
    [Key in string]?: JsonValue;
};

export interface JsonArray extends Array<JsonValue> { }

export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;

export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> { }

export type InputJsonObject = {
    readonly [Key in string]?: InputJsonValue | null;
};

export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | {
    toJSON(): unknown;
};
