import type {
  DmcaNoticeCreate,
  DmcaNoticeGeneratedContent,
  DmcaNoticeGet,
  DmcaNoticeUpdate,
  DmcaPlatformGet,
  DmcaProfileCreate,
  DmcaProfileGet,
  DmcaProfileUpdate,
} from "@vigilart/shared/types";
import { authenticatedFetch } from "../../utils/auth/authenticatedFetch";

const getApiBase = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const extractData = <T>(raw: unknown): T => {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: T }).data;
  }

  return raw as T;
};

const parseErrorMessage = async (response: Response) => {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const raw = await response.json();

    if (raw && typeof raw === "object") {
      if ("message" in raw && typeof raw.message === "string") {
        return raw.message;
      }

      if ("error" in raw && typeof raw.error === "string") {
        return raw.error;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
};

export const fetchDmcaPlatforms = async (): Promise<DmcaPlatformGet[]> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/platform/`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaPlatformGet[]>(await response.json());
};

export const fetchDmcaProfile = async (userId: string): Promise<DmcaProfileGet | null> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/profile/${userId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaProfileGet>(await response.json());
};

export const createDmcaProfile = async (
  userId: string,
  payload: DmcaProfileCreate
): Promise<DmcaProfileGet> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/profile/${userId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaProfileGet>(await response.json());
};

export const updateDmcaProfile = async (
  userId: string,
  payload: DmcaProfileUpdate
): Promise<DmcaProfileGet> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/profile/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaProfileGet>(await response.json());
};

export const fetchUserDmcaNotices = async (userId: string): Promise<DmcaNoticeGet[]> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/notice/user/${userId}`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaNoticeGet[]>(await response.json());
};

export const createDmcaNotice = async (payload: DmcaNoticeCreate): Promise<DmcaNoticeGet> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/notice/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaNoticeGet>(await response.json());
};

export const updateDmcaNotice = async (
  noticeId: string,
  payload: DmcaNoticeUpdate
): Promise<DmcaNoticeGet> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/notice/${noticeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaNoticeGet>(await response.json());
};

export const generateDmcaNotice = async (noticeId: string): Promise<DmcaNoticeGeneratedContent> => {
  const response = await authenticatedFetch(`${getApiBase()}/dmca/notice/${noticeId}/generate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return extractData<DmcaNoticeGeneratedContent>(await response.json());
};
