/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "knowear.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "knowearcommerce.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com", // ✅ Add Giphy here
      },
    ],
  },
};

export default nextConfig;
