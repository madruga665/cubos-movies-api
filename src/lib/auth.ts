import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.FRONTEND_URL,
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
});
