/** @type {import('next').NextConfig} */
const nextConfig = {
  // 代理后端 API，开发时避免跨域问题
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
