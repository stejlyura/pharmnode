import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    tariff?: string;
    renewsAt?: string | null;
  }
  interface Session {
    user: {
      id: string;
      tariff: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      renewsAt?: string | null;
    };
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    tariff?: string;
    renewsAt?: string | null;
  }
}
