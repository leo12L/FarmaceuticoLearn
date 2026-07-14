import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mysql2 no está en la lista que Next externaliza automáticamente (sí lo están
  // `pg` y `mongodb`). Sin esto, el bundler intenta empaquetarlo y rompe por sus
  // dependencias nativas de Node.
  serverExternalPackages: ["mysql2"],
};

export default nextConfig;
