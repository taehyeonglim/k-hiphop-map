import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', devIndicators: false, allowedDevOrigins: ['127.0.0.1'], images: { unoptimized: true }, trailingSlash: true };
export default config;
