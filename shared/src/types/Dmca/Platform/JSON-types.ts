import { InferPlatformPayload } from ".";
import {
    DeviantArtDmcaFormJSON,
    InstagramDmcaFormJSON,
    EtsyDmcaFormJSON,
    OtherDmcaFormJSON,
    PinterestDmcaFormJSON,
    RedbubbleDmcaFormJSON,
    TumblrDmcaFormJSON,
    XDmcaFormJSON
} from "../../../constants";

export type DeviantArtDmcaPayload = InferPlatformPayload<typeof DeviantArtDmcaFormJSON>;
export type InstagramDmcaPayload = InferPlatformPayload<typeof InstagramDmcaFormJSON>;
export type EtsyDmcaPayload = InferPlatformPayload<typeof EtsyDmcaFormJSON>;
export type OtherDmcaPayload = InferPlatformPayload<typeof OtherDmcaFormJSON>;
export type PinterestDmcaPayload = InferPlatformPayload<typeof PinterestDmcaFormJSON>;
export type RedbubbleDmcaPayload = InferPlatformPayload<typeof RedbubbleDmcaFormJSON>;
export type TumblrDmcaPayload = InferPlatformPayload<typeof TumblrDmcaFormJSON>;
export type XDmcaPayload = InferPlatformPayload<typeof XDmcaFormJSON>;
