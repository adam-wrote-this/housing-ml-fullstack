/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://app1-python:8001";
    const javaBackendUrl =
      process.env.JAVA_BACKEND_URL || "http://app2-java:8080";

    return [
      {
        source: "/api/python/:path*",
        destination: `${pythonBackendUrl}/:path*`
      },
      {
        source: "/api/java/:path*",
        destination: `${javaBackendUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
