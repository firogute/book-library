import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { sendEmail } from "@/lib/workflow";
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

  // Welcome Email
  await context.run("new-signup", async () => {
    await sendEmail("firo_template", {
      subject: "Welcome to the platform",
      name: fullName,
      replyto: "firomsaguteta11@gmail.com",
      to: email,
      senderName: "Firomsa Guteta",
    });

    return "Welcome email sent";
  });

  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail("inactivity_template", {
          subject: "We miss you😁",
          name: fullName,
          replyto: "firomsaguteta11@gmail.com",
          to: email,
          senderName: "Firomsa Guteta",
        });
      });
    } else if (state === "active") {
      await context.run("send-newsletter", async () => {
        await sendEmail("active_user_template", {
          subject: "Here's What's New ✨",
          name: fullName,
          replyto: "firomsaguteta11@gmail.com",
          to: email,
          senderName: "Firomsa Guteta",
        });

        return "Newsletter sent to active user";
      });
    }

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
