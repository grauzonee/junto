import { Category, ICategory } from "@/models/Category";

interface SeedCategory extends ICategory {
    subcategories?: ICategory[]
}
export async function seed() {
    const categories: SeedCategory[] = [
        {
            title: "Social",
            parent: undefined,
            subcategories: [
                {
                    title: "New in town"
                },
                {
                    title: "Event attending"
                }

            ]
        },
        {
            title: "Educating",
            parent: undefined,
            subcategories: [
                {
                    title: "History"
                },
                {
                    title: "Economics"
                }

            ]
        },
        {
            title: "Hobby",
            parent: undefined,
            subcategories: [
                {
                    title: "Drawing"
                },
                {
                    title: "Cooking"
                },
                {
                    title: "Technology"
                }

            ]
        },
        {
            title: "Environmental",
            parent: undefined,
            subcategories: [
                {
                    title: "Cleaning up"
                },

            ]
        },
    ];
    await createCategories(categories);

    if (!process.env.JEST_WORKER_ID) {
        // eslint-disable-next-line
        console.log("Categories seeding done.");
    }
}

async function createCategories(categories: SeedCategory[]) {
    for (const item of categories) {
        const exists = await Category.findOne({ title: item.title, parent: item.parent });
        if (!exists) {
            const savedCategory = await Category.create(item);
            if (item.subcategories) {
                item.subcategories.forEach(subcategory => {
                    subcategory.parent = savedCategory.id
                })
                await createCategories(item.subcategories);
            }

            if (!process.env.JEST_WORKER_ID) {
                // eslint-disable-next-line
                console.log(`Created: ${item.title}`);
            }
        }
    }
}
