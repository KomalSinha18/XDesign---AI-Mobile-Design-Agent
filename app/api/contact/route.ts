import { NextResponse } from "next/server";
import { Resend } from "resend";

// Validate API key exists
if (!process.env.RESEND_API_KEY) {
  console.error("⚠️  RESEND_API_KEY is not set in environment variables");
  console.error("   Please add RESEND_API_KEY to your .env file");
  console.error("   Get your API key from: https://resend.com/api-keys");
}

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const { planName, userEmail, userName } = await request.json();

    if (!planName) {
      return NextResponse.json(
        {
          error: "Plan name is required",
        },
        { status: 400 }
      );
    }

    // Check if Resend is configured
    if (!resend || !process.env.RESEND_API_KEY) {
      console.error("Resend API key is missing");
      return NextResponse.json(
        {
          error: "Email service is not configured. Please set RESEND_API_KEY in your environment variables.",
          details: "Get your API key from https://resend.com/api-keys",
        },
        { status: 500 }
      );
    }

    // Send email to your address
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "XDesign AI <onboarding@resend.dev>",
      to: "komalsinhachini@gmail.com",
      subject: `New ${planName} Plan Interest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Pricing Plan Interest</h2>
          <p><strong>Plan:</strong> ${planName}</p>
          ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ""}
          ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ""}
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Someone clicked on the ${planName} plan button on your pricing page.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: error.message || JSON.stringify(error),
          ...(process.env.NODE_ENV === "development" && {
            fullError: error,
          }),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error?.message || String(error),
        ...(process.env.NODE_ENV === "development" && {
          stack: error?.stack,
        }),
      },
      { status: 500 }
    );
  }
}

