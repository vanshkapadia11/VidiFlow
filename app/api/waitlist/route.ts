import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, tool } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Log to console for now — swap for DB/Resend/Mailchimp later
    console.log(`[WAITLIST] ${tool}: ${email}`);

    // TODO: save to DB or email service
    // await db.waitlist.create({ data: { email, tool } });
    // await resend.emails.send({ to: email, subject: "You're on the list!" ... });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}