/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    domains: ['images.unsplash.com', 'www.w3schools.com'],
    unoptimized: true,
  },
};

export default nextConfig;
