import { Interest } from "@/models/Interest";

export async function seed() {
  const interests = [
    { title: "Technology" },
    { title: "Art" },
    { title: "Music" },
    { title: "Sports" },
    { title: "Travel" },
    { title: "Food" },
    { title: "Science" },
    { title: "Literature" },
    { title: "Gaming" },
    { title: "Fitness" },
  ];

  for (const item of interests) {
    const exists = await Interest.findOne({ title: item.title });
    if (!exists) {
      await Interest.create(item);
      // eslint-disable-next-line
      console.log(`Created: ${item.title}`);
    }
  }
  // eslint-disable-next-line
  console.log("Interests seeding done.");
}
