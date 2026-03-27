/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем статическую генерацию
  output: 'standalone',
  // Отключаем минификацию для отладки
  swcMinify: true,
};

export default nextConfig;
