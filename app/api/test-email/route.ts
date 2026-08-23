import { NextResponse } from "next/server";
import { transporter } from "@/lib/mail";

export async function GET() {
  try {
    await transporter.sendMail({
      from: `"CyberShield" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "CyberShield Email Test ✅",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>CyberShield Email Test</h2>
          <p>Congratulations! 🎉</p>
          <p>Your Gmail SMTP configuration is working correctly.</p>
          <hr />
          <p><strong>CyberShield Verification Portal</strong></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email.",
      },
      { status: 500 }
    );
  }
}