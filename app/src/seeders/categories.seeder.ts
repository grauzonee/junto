import { Category } from "@/models/Category";

export async function seed() {
  const categories = [
    { title: "Social" },
    { title: "Educating" },
    { title: "Hobby" },
    { title: "Online" },
    { title: "Environmental" },
    { title: "Lection" },
  ];

  for (const item of categories) {
    const exists = await Category.findOne({ title: item.title });
    if (!exists) {
      await Category.create(item);
      // eslint-disable-next-line
      console.log(`Created: ${item.title}`);
    }
  }
  // eslint-disable-next-line
  console.log("Categories seeding done.");
}
