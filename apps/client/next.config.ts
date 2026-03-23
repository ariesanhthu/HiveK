import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler (Babel) làm build/compile chậm. Tắt để tăng tốc.
  // Bật lại với compilationMode: 'annotation' nếu cần memo cho từng component.
  reactCompiler: false,
};

export default nextConfig;
