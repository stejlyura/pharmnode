import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';

// Get absolute path to project root
const projectRoot = path.resolve(__dirname, '../..');

describe('Security Fallback Secrets Verification (Isolation)', () => {
  it('should throw an error in encryption.ts if NODE_ENV is production and ENCRYPTION_KEY is missing', () => {
    expect(() => {
      execSync('npx tsx -e "import(\'./src/lib/encryption.ts\')"', {
        cwd: projectRoot,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          ENCRYPTION_KEY: '',
        },
        stdio: 'pipe',
      });
    }).toThrow();
  });

  it('should not throw an error in encryption.ts if NODE_ENV is development and ENCRYPTION_KEY is missing', () => {
    const output = execSync('npx tsx -e "import(\'./src/lib/encryption.ts\').then(() => console.log(\'OK\'))"', {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ENCRYPTION_KEY: '',
      },
    }).toString().trim();
    expect(output).toBe('OK');
  });

  it('should throw an error in auth.ts if NODE_ENV is production and ADMIN_USERNAME is missing', () => {
    expect(() => {
      execSync('npx tsx -e "import(\'./src/lib/auth.ts\')"', {
        cwd: projectRoot,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          ADMIN_PASSWORD: 'some-password',
          NEXTAUTH_SECRET: 'some-secret',
          ADMIN_USERNAME: '',
        },
        stdio: 'pipe',
      });
    }).toThrow();
  });

  it('should throw an error in auth.ts if NODE_ENV is production and ADMIN_PASSWORD is missing', () => {
    expect(() => {
      execSync('npx tsx -e "import(\'./src/lib/auth.ts\')"', {
        cwd: projectRoot,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          ADMIN_USERNAME: 'some-username',
          NEXTAUTH_SECRET: 'some-secret',
          ADMIN_PASSWORD: '',
        },
        stdio: 'pipe',
      });
    }).toThrow();
  });

  it('should throw an error in auth.ts if NODE_ENV is production and NEXTAUTH_SECRET is missing', () => {
    expect(() => {
      execSync('npx tsx -e "import(\'./src/lib/auth.ts\')"', {
        cwd: projectRoot,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          ADMIN_USERNAME: 'some-username',
          ADMIN_PASSWORD: 'some-password',
          NEXTAUTH_SECRET: '',
        },
        stdio: 'pipe',
      });
    }).toThrow();
  });

  it('should not throw an error in auth.ts if NODE_ENV is development and variables are missing', () => {
    const output = execSync('npx tsx -e "import(\'./src/lib/auth.ts\').then(() => console.log(\'OK\'))"', {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ADMIN_USERNAME: '',
        ADMIN_PASSWORD: '',
        NEXTAUTH_SECRET: '',
      },
    }).toString().trim();
    expect(output).toBe('OK');
  });
});
