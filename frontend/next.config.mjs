/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow server-side env vars to be read on the client via NEXT_PUBLIC_ prefix
  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CONTRACT_NAME: process.env.NEXT_PUBLIC_CONTRACT_NAME,
    NEXT_PUBLIC_STACKS_API: process.env.NEXT_PUBLIC_STACKS_API,
  },
};

export default nextConfig;
