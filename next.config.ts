import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const r2RemotePattern = r2PublicUrl
  ? (() => {
      const url = new URL(r2PublicUrl);
      return { protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname };
    })()
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(r2RemotePattern ? [r2RemotePattern] : []),
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
