import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheckIcon } from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy — VidiFlow",
  description:
    "How VidiFlow handles your data. No accounts, no stored media files, no selling your information. Read the full privacy policy.",
  alternates: {
    canonical: "https://www.vidiflow.co/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "June 25, 2026";

const sections = [
  {
    title: "1. What this policy covers",
    body: [
      'This policy explains what information VidiFlow ("we", "us") collects when you use vidiflow.co and its tools, why we collect it, and what we don\'t do with it. It applies to everyone who visits the site, whether or not you use a downloader or other tool.',
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "We don't require an account to use any tool on VidiFlow, so we don't collect names, emails, or passwords just to let you download something.",
      "When you paste a link into a tool, we temporarily process that URL on our server to fetch and return the public media or data you requested. We do not store a copy of the media you download, and we don't keep a record tying a specific download to a specific person.",
      "Like most websites, our hosting and analytics providers automatically log standard technical data — things like IP address, browser type, device type, pages visited, and approximate location at a country or city level. This is used in aggregate to understand traffic and fix bugs, not to identify individual visitors.",
      "If you contact us by email, we keep that conversation so we can respond to you and follow up if needed.",
    ],
  },
  {
    title: "3. How we use information",
    body: [
      "To operate the tool you requested — fetching and returning the media or data tied to the link you submitted.",
      "To understand aggregate usage (which tools get used, where traffic comes from) so we can prioritize what to build or fix next.",
      "To keep the service secure and stop abuse, such as automated scraping or attempts to overload the service.",
      "We do not sell your information to third parties, and we do not use what you download to build an advertising profile of you.",
    ],
  },
  {
    title: "4. Cookies and similar technology",
    body: [
      "We may use a small number of cookies or local storage entries to remember basic preferences (like a selected video quality) and to run analytics. You can block or clear cookies in your browser at any time; doing so won't stop the core download tools from working, since they don't require an account or session.",
    ],
  },
  {
    title: "5. Third-party services",
    body: [
      "We rely on third-party infrastructure to run VidiFlow — for example, hosting, content delivery (CDN), and analytics providers. These providers may process technical data (like IP address) as part of delivering their service to us, under their own privacy policies.",
      "VidiFlow tools work with publicly available content from platforms such as TikTok, YouTube, Instagram, Pinterest, Snapchat, Twitter/X, LinkedIn, Twitch, Reddit, and Facebook. We are not affiliated with, endorsed by, or sponsored by any of these platforms. When you use our tools, you're interacting with content hosted by them — their own terms and privacy practices govern that content.",
    ],
  },
  {
    title: "6. Data retention",
    body: [
      "Technical/server logs are kept only as long as needed for security and debugging, then deleted on a routine basis. Media you download passes through our server in transit and is not retained afterward. Emails you send us are kept until you ask us to delete them or until they're no longer needed.",
    ],
  },
  {
    title: "7. Your rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, or request deletion of personal data we hold about you. Since we don't tie downloads to identities, there is typically very little personal data to act on — but if you've emailed us directly, you can ask us to delete that correspondence at any time by writing to the address below.",
    ],
  },
  {
    title: "8. Children's privacy",
    body: [
      "VidiFlow is not directed at children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided us personal information, contact us and we'll remove it.",
    ],
  },
  {
    title: "9. Changes to this policy",
    body: [
      'We may update this policy as the site or tools change. If we make a material change, we\'ll update the "last updated" date below. Continued use of VidiFlow after a change means you accept the updated policy.',
    ],
  },
  {
    title: "10. Contact us",
    body: [
      "Questions about this policy or how your data is handled? Email us at hello@vidiflow.co and we'll get back to you.",
    ],
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-red-50 font-sans text-zinc-900">
      <Navbar />
      <Breadcrumbs
        items={[
          {
            name: "Privacy Policy",
            href: "/privacy-policy",
          },
        ]}
      />
      <main className="max-w-4xl mx-auto p-6 lg:py-12 antialiased">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-red-600" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Privacy Policy
              </span>
            </div>
          </div>

          <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-black tracking-tighter uppercase italic leading-[0.9] text-zinc-900">
            Your data,
            <br />
            <span className="text-red-600">handled plainly.</span>
          </h1>

          <p className="mt-4 max-w-xl text-zinc-500 font-medium text-base leading-relaxed">
            No accounts. No stored media. No selling your information. Here's
            exactly what we collect and why.
          </p>

          <p className="mt-4 text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Policy sections */}
        <Card className="border-zinc-200/60 shadow-sm rounded-[24px] bg-white">
          <CardContent className="p-8 md:p-10 space-y-9">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-black text-sm uppercase tracking-wide text-zinc-900 mb-3">
                  {s.title}
                </h2>
                <div className="space-y-3">
                  {s.body.map((p, i) => (
                    <p
                      key={i}
                      className="text-zinc-500 text-[14px] leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      <CreatorFooter />
    </div>
  );
};

export default PrivacyPolicyPage;