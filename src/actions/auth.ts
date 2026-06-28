"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Server Action to request a password reset.
 * Generates a secure token, sets an expiration date, and logs/sends a reset link.
 */
export async function requestPasswordReset(email: string) {
  try {
    // Apply rate limit: max 5 attempts per 15 minutes per IP
    const limiter = await rateLimit("password_reset", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.success) {
      return { 
        success: false, 
        error: "Too many password reset requests. Please try again in a few minutes." 
      };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify if the user exists in our database
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    // Generate secure token and expiry time (2 hours)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // In a fully featured credentials setup, you would persist the token to the DB.
    // Since the project primarily uses OAuth, we simulate email delivery and print 
    // the parameters to the server logs.
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(trimmedEmail)}`;

    console.log("=== PASSWORD RESET REQUEST ===");
    console.log(`Target Email: ${trimmedEmail}`);
    console.log(`Exists In DB: ${!!user}`);
    console.log(`Token: ${token}`);
    console.log(`Expires At: ${expiresAt.toISOString()}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log("==============================");

    // Call mailer integration
    await sendResetEmail(trimmedEmail, resetUrl);

    return { 
      success: true, 
      message: "If the email is registered, a password reset link has been sent to it." 
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Reset password failed";
    console.error("Error in requestPasswordReset Action:", error);
    return { success: false, error: msg };
  }
}

/**
 * Email transport integration.
 * Sends the reset email using Resend API, falling back to console logging if not configured.
 */
async function sendResetEmail(email: string, resetUrl: string) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "no-reply@pharmnode.com";

    if (resendKey) {
      console.log(`[Mailer] Resend mailer active. Dispatching password reset to ${email}`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: email,
          subject: "Password Reset - PharmNode",
          html: `<p>You requested a password reset. Click the link below to set a new password:</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>
                 <p>If you did not request this, you can ignore this email.</p>`,
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Mailer] Resend API error: ${response.status} - ${errText}`);
      } else {
        console.log(`[Mailer] Email sent successfully via Resend to ${email}`);
      }
    } else {
      console.log(`[Mailer] No mailer API keys configured. Simulating delivery to ${email} (check server console for reset URL)`);
    }
  } catch (error) {
    console.error("[Mailer] Exception in sendResetEmail:", error);
  }
}

/**
 * Sends a verification email to a newly registered user.
 * Supports Resend, and local console log fallback.
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "no-reply@pharmnode.com";

    if (resendKey) {
      console.log(`[Mailer] Resend mailer active. Dispatching email verification to ${email}`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: email,
          subject: "Confirm your email - PharmNode",
          html: `<p>Thank you for registering! Please click the link below to verify your email address:</p>
                 <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                 <p>If you did not register, you can ignore this email.</p>`,
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Mailer] Resend API error: ${response.status} - ${errText}`);
      } else {
        console.log(`[Mailer] Email verification sent successfully via Resend to ${email}`);
      }
    } else {
      console.log(`[Mailer] No mailer API keys configured. Simulating email verification delivery to ${email}.\nVerification URL: ${verificationUrl}`);
    }
  } catch (error) {
    console.error("[Mailer] Exception in sendVerificationEmail:", error);
  }
}

/**
 * Server Action to resend the verification email.
 * Rate limited to prevent spam.
 */
export async function resendVerificationEmailAction(email: string) {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Введите корректный email адрес" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Rate limit: max 3 attempts per 15 minutes per IP
    const limiter = await rateLimit("resend_verification", {
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.success) {
      return {
        success: false,
        error: "Слишком много запросов. Пожалуйста, попробуйте позже."
      };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      // Return success even if user not found to prevent user enumeration
      return { success: true };
    }

    if (user.emailVerified) {
      return { success: true, message: "Email уже подтвержден." };
    }

    // Generate a new verification token if one doesn't exist, or reuse/regenerate
    const verificationToken = user.emailVerificationToken || crypto.randomUUID();

    if (!user.emailVerificationToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken: verificationToken }
      });
    }

    // Send email verification link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(trimmedEmail)}`;
    await sendVerificationEmail(trimmedEmail, verificationUrl);

    return { success: true };
  } catch (error) {
    console.error("Error in resendVerificationEmailAction server action:", error);
    return { success: false, error: "Не удалось отправить письмо. Пожалуйста, попробуйте позже." };
  }
}
