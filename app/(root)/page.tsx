import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { Button } from "@/components/ui/button";
import { sampleBooks } from "@/constants";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { sendEmail } from "@/lib/email";

const Home = async () => {
  const result = await db.select().from(users);

  // (async () => {
  //   await sendEmail({
  //     to: "firomsaguteta10@gmail.com",
  //     subject: "Test SMTP",
  //     html: "<p>Hello from sampler</p>",
  //   });
  // })();

  return (
    <>
      <BookOverview {...sampleBooks[0]} />
      <BookList
        title="Latest Books"
        books={sampleBooks}
        containerClassName="mt-28"
      />
    </>
  );
};
export default Home;
