import { GetRequestNormal } from "@/api-hooks/api-hooks";

type SiteNoticePayload = {
  noticeEnabled?: boolean;
  noticeText?: string | null;
};

async function getSiteNotice() {
  try {
    return await GetRequestNormal<SiteNoticePayload>(
      "/web-settings/site?key=default",
      0,
      "site-settings-notice",
    );
  } catch {
    return null;
  }
}

export async function SiteNoticeBar() {
  const site = await getSiteNotice();
  const noticeEnabled = site?.noticeEnabled === true;
  const noticeText = site?.noticeText?.trim();

  if (!noticeEnabled || !noticeText) {
    return null;
  }

  return (
    <div className="w-full border-b border-primary/20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 px-4 py-2 text-center text-xs font-medium text-on-surface sm:text-sm">
      {noticeText}
    </div>
  );
}
