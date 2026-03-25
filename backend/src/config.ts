import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? "5000"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  jwtSecret: required("JWT_SECRET"),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@vcet.ac.in",
  adminPassword: required("ADMIN_PASSWORD")
};

