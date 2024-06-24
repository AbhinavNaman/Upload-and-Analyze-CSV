/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://chat2plot.azurewebsites.net/api/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;
  