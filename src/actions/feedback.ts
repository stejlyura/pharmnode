"use server";

import { rateLimit } from "@/lib/rateLimit";

export interface FeedbackData {
  type: string;
  message: string;
  email?: string;
  path?: string;
  userAgent?: string;
}

/**
 * Server Action to submit feedback messages and bug reports.
 * Rate-limits requests (max 5 per 15 minutes per IP) and forwards alerts to Telegram.
 */
export async function sendFeedback(data: FeedbackData) {
  try {
    // 1. Rate limit: max 5 requests per 15 minutes per IP
    const limiter = await rateLimit("feedback_submission", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.success) {
      return {
        success: false,
        error: "Too many feedback submissions. Please try again in a few minutes.",
      };
    }

    const { type, message, email, path, userAgent } = data;

    if (!type || !message || message.trim().length === 0) {
      return {
        success: false,
        error: "Feedback type and message content are required fields.",
      };
    }

    const trimmedMsg = message.trim();
    const userEmail = email?.trim() || "Anonymous";

    // 2. Format HTML notification message for Telegram
    const formattedMessage = [
      `<b>📬 PharmNode Support Alert</b>`,
      `==============================`,
      `<b>Type:</b> <code>${type}</code>`,
      `<b>User:</b> ${userEmail}`,
      `<b>Page Path:</b> <code>${path || "N/A"}</code>`,
      `<b>User Agent:</b> <pre>${userAgent || "N/A"}</pre>`,
      `<b>Time (UTC):</b> ${new Date().toISOString()}`,
      `==============================`,
      `<b>Message:</b>`,
      `<i>${trimmedMsg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</i>`,
    ].join("\n");

    console.log("=== USER FEEDBACK SUBMISSION ===");
    console.log(`Type:       ${type}`);
    console.log(`From:       ${userEmail}`);
    console.log(`Path:       ${path || "N/A"}`);
    console.log(`Message:    ${trimmedMsg}`);
    console.log("================================");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 3. Dispatch to Telegram Bot API if configured
    if (botToken && chatId && !botToken.includes("your-") && !chatId.includes("your-")) {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedMessage,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`Telegram Bot API Error: Status ${response.status} - ${errBody}`);
        return {
          success: false,
          error: "Unable to deliver message to support channel. Please try again later.",
        };
      }
    } else {
      console.warn(
        "[Feedback Server Action] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Running in simulation mode."
      );
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Feedback delivery failed";
    console.error("Error in sendFeedback Server Action:", error);
    return { success: false, error: errorMsg };
  }
}
