/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        "node:buffer": false,
        "node:crypto": false,
        "node:events": false,
        "node:fs": false,
        "node:http": false,
        "node:https": false,
        "node:net": false,
        "node:os": false,
        "node:path": false,
        "node:process": false,
        "node:stream": false,
        "node:string_decoder": false,
        "node:tls": false,
        "node:url": false,
        "node:util": false,
        "node:zlib": false,
      }

      // Fallbacks for Node.js built-in modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        http2: false,
      }
    }
    return config
  },
  // Updated: Use serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ["firebase-admin"],
  // Server Actions are not supported with static export
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: "2mb",
  //   },
  // },
}

module.exports = nextConfig
