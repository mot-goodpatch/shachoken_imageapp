import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.io'],
}

export default nextConfig
