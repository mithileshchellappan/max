import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const emailVerification = Email({
  id: "email-verification",
  from: process.env.AUTH_EMAIL_FROM ?? "Max <onboarding@resend.dev>",
  maxAge: 15 * 60,
  async sendVerificationRequest({ identifier, token, provider }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required for password email verification");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM ?? provider.from,
        to: identifier,
        subject: "Verify your Max email",
        text: `Use this code to verify your Max account: ${token}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send verification email: ${response.status} ${await response.text()}`);
    }
  },
});

const passwordProfile = (params: Record<string, unknown>) => {
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
  if (!email) {
    throw new Error("Email is required");
  }
  return { email };
};

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password({ verify: emailVerification, profile: passwordProfile })],
});
