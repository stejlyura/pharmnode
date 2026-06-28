import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, needsUpgrade, validatePassword } from "./password";
import crypto from "node:crypto";

describe("Password Hashing & Verification System", () => {
  const password = "SuperSecretPassword123";

  it("should hash password to a valid bcrypt format", () => {
    const hash = hashPassword(password);
    
    // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")).toBe(true);
    expect(hash.length).toBe(60);
  });

  it("should verify correct password against bcrypt hash", () => {
    const hash = hashPassword(password);
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it("should reject incorrect password against bcrypt hash", () => {
    const hash = hashPassword(password);
    expect(verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("should verify correct password against legacy PBKDF2 hash", () => {
    // Generate legacy PBKDF2 hash
    const salt = crypto.randomBytes(16).toString("hex");
    const pbkdf2Hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    const storedValue = `${salt}:${pbkdf2Hash}`;

    expect(verifyPassword(password, storedValue)).toBe(true);
  });

  it("should reject incorrect password against legacy PBKDF2 hash", () => {
    // Generate legacy PBKDF2 hash
    const salt = crypto.randomBytes(16).toString("hex");
    const pbkdf2Hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    const storedValue = `${salt}:${pbkdf2Hash}`;

    expect(verifyPassword("WrongPassword", storedValue)).toBe(false);
  });

  it("should properly identify legacy hashes that need upgrade", () => {
    const salt = crypto.randomBytes(16).toString("hex");
    const pbkdf2Hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    const legacyHash = `${salt}:${pbkdf2Hash}`;

    const newHash = hashPassword(password);

    expect(needsUpgrade(legacyHash)).toBe(true);
    expect(needsUpgrade(newHash)).toBe(false);
  });
});

describe("validatePassword", () => {
  it("should validate strong passwords conforming to all requirements", () => {
    expect(validatePassword("ValidPass123")).toBe(true);
    expect(validatePassword("SecureP@ssw0rd")).toBe(true);
  });

  it("should reject passwords shorter than 8 characters", () => {
    expect(validatePassword("Sh0rt1")).toBe(false);
  });

  it("should reject passwords without uppercase letters", () => {
    expect(validatePassword("lowercase123")).toBe(false);
  });

  it("should reject passwords without lowercase letters", () => {
    expect(validatePassword("UPPERCASE123")).toBe(false);
  });

  it("should reject passwords without digits", () => {
    expect(validatePassword("NoDigitsPassword")).toBe(false);
  });
});
