import ImageKit from "imagekit";
import dummyBooks from "../dummybooks.json";
import { db } from "./drizzle";
import { books } from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import pLimit from "p-limit";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const uploadToImageKit = async (
  url: string,
  fileName: string,
  folder: string
) => {
  try {
    const res = await imageKit.upload({
      file: url,
      fileName,
      folder,
    });
    return res.filePath;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    return null;
  }
};

const seed = async () => {
  console.log("Seeding data...");

  const limit = pLimit(5);

  const tasks = dummyBooks.map((book) =>
    limit(async () => {
      const [coverUrl, videoUrl] = await Promise.all([
        uploadToImageKit(book.coverUrl, `${book.title}.jpg`, "/book/covers"),
        uploadToImageKit(book.videoUrl, `${book.title}.mp4`, "/book/videos"),
      ]);

      if (!coverUrl || !videoUrl) {
        console.warn(`Skipping "${book.title}" due to upload failure.`);
        return;
      }

      await db.insert(books).values({
        ...book,
        coverUrl,
        videoUrl,
      });

      console.log(`Seeded: ${book.title}`);
    })
  );

  try {
    await Promise.all(tasks);
    console.log("✅ All data seeded successfully.");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  }
};

seed();
