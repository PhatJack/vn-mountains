import type { NextConfig } from "next";

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

export default nextConfig;
