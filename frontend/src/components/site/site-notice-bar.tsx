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
    <div className="w-full border-b border-primary/10 bg-[linear-gradient(90deg,rgba(15,23,42,0.08),rgba(255,255,255,0.72),rgba(15,23,42,0.08))] px-4 py-2.5 text-center font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface sm:text-xs">
      {noticeText}
    </div>
  );
}
