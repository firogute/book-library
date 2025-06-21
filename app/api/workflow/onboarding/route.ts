import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { sendEmail } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

type UserState = "non-active" | "active";
type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    // If user does not exist, treat as "non-active" or "active" as per your logic
    return "non-active";
  } else {
    const lastActivityDate = new Date(user[0].lastActivityDate!);
    const now = new Date();
    const timeDifference = now.getTime() - lastActivityDate.getTime();

    if (
      timeDifference > THREE_DAYS_IN_MS &&
      timeDifference <= THIRTY_DAYS_IN_MS
    ) {
      return "non-active";
    } else {
      return "active";
    }
  }
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // 1️⃣ Send Welcome Email
  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: "Welcome to Our Platform!",
      message: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #0052cc;">Welcome to Our Platform, ${fullName}!</h1>
          <p>Hi ${fullName},</p>
          <p>Thank you for joining us! We're excited to have you on board.</p>
          <p>Get started by exploring your dashboard and discover all the amazing features we offer.</p>
          <p>If you have any questions, feel free to reply to this email or contact our support team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>.</p>
          <br/>
          <p>Best regards,<br/>Firomsa Guteta & Team</p>
          <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">This is an automated email. Please do not reply directly to this message.</small>
        </div>
      `,
    });

    return "Welcome email sent";
  });

  // 2️⃣ Wait 3 days
  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email); // must return "active" or "non-active"
    });

    // 3️⃣ Non-active email
    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "We Miss You at Our Platform",
          message: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h1 style="color: #e55353;">We Miss You, ${fullName}!</h1>
              <p>Hi ${fullName},</p>
              <p>It looks like you haven’t logged in for a while. We’d love to have you back!</p>
              <p>There are new features and updates waiting for you. Come check them out!</p>
              <p>If you need assistance or have any questions, reply to this email or reach out to <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>.</p>
              <br/>
              <p>Warm regards,<br/>Firomsa Guteta & Team</p>
              <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;" />
              <small style="color: #999;">This is an automated email. Please do not reply directly to this message.</small>
            </div>
          `,
        });
      });
    }

    // 4️⃣ Wait 30 days, check again
    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});

// import { serve } from "@upstash/workflow/nextjs";

// export const { POST } = serve(async (context) => {
//   await context.run("initial-step", () => {
//     console.log("initial step ran");
//   });

//   await context.run("second-step", () => {
//     console.log("second step ran");
//   });
// });
