import type { NextConfig } from "next";
import dotenv from 'dotenv';
import path from 'path';

// Solo cargar .env local en desarrollo
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), 'src/config/.env') });
}

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
