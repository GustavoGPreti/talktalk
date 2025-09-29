import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    }
  },
  images: {
    remotePatterns: [
      {
        hostname: "*",
      },
    ],
  },

};

export default MillionLint.next({
  enabled: true,
  rsc: false
})(nextConfig);
