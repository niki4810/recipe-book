import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "test@rb.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("Test1234!", 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // delete existing recipe along with its ingredients and instructions
  const recipe = await prisma.recipe.findFirst({where: {
    name: "Mirchi Ka Salan",
    userId: user.id
  }});

  if(recipe) {
    await prisma.recipeIngredient.deleteMany({
      where: {
        recipeId: recipe.id
      }
    });

    await prisma.recipeInstruction.deleteMany({
      where: {
        recipeId: recipe.id
      }
    });

    await prisma.recipe.delete({
      where: {
        id: recipe.id
      }
    });
  }


  // create recipe
  const recipeOne = await prisma.recipe.create({
    data: {
      imageUrl: "https://via.placeholder.com/200",
      name: "Mixed Vegetable Curry",
      durationInMins: 60,
      description: "Authentic Indian Vegetable curry. Goes well with flavored rice",
      userId: user.id
    }
  });


  // Add Ingredients
  type IngredientUnitType = "tablespoon" | "count" | "inch" | "cup" | "ml" | "grams" | "oz";

  type IngredientType = {
    name: string;
    quantity: string;
    unit: IngredientUnitType;
  };

  let ingredientsOne: IngredientType[] = [
    {
      name: "Penuts",
      quantity: "2",
      unit: "tablespoon"
    },
    {
      name: "Seseeme Seeds",
      quantity: "2",
      unit: "tablespoon"
    },
    {
      name: "Poppy Seeds",
      quantity: "2",
      unit: "tablespoon"
    },
    {
      name: "Methi Seeds",
      quantity: "1/4th",
      unit: "tablespoon"
    },
    {
      name: "Coconut",
      quantity: "2",
      unit: "tablespoon"
    },
    {
      name: "Garlic",
      quantity: "2",
      unit: "count"
    },
    {
      name: "ginger",
      quantity: "1",
      unit: "inch"
    },
    {
      name: "water",
      quantity: "1/2",
      unit: "cup"
    },
    {
      name: "oil",
      quantity: "3",
      unit: "tablespoon"
    },
    {
      name: "Green chilli",
      quantity: "6",
      unit: "count"
    },
    {
      name: "Mustard Seeds",
      quantity: "1",
      unit: "tablespoon"
    },
    {
      name: "Mustard Seeds",
      quantity: "1",
      unit: "tablespoon"
    },
    {
      name: "Cumin Seeds",
      quantity: "1",
      unit: "tablespoon"
    },
    {
      name: "Curry Leaves",
      quantity: "few",
      unit: "count"
    },
    {
      name: "Onions",
      quantity: "1/2",
      unit: "cup"
    },
    {
      name: "Turmuric",
      quantity: "1/2",
      unit: "tablespoon"
    },
    {
      name: "Chilli Powder",
      quantity: "1",
      unit: "tablespoon"
    },
    {
      name: "Garam Masala",
      quantity: "1/2",
      unit: "tablespoon"
    },
    {
      name: "Coriander powder",
      quantity: "1",
      unit: "tablespoon"
    },
    {
      name: "Cumin Powder",
      quantity: "1/2",
      unit: "tablespoon"
    },
    {
      name: "Salt",
      quantity: "1/2",
      unit: "tablespoon"
    },
    {
      name: "Tamirind Juice",
      quantity: "1",
      unit: "cup"
    },
    {
      name: "Bellam",
      quantity: "1/2",
      unit: "tablespoon"
    },
    {
      name: "Water",
      quantity: "1",
      unit: "cup"
    },
    {
      name: "Coriander",
      quantity: "2",
      unit: "tablespoon"
    },
  ];

  for(let ingredient of ingredientsOne) {
    await prisma.recipeIngredient.create({
      data: {
        name: ingredient.name,
        quantity:ingredient.quantity,
        unit: ingredient.unit,
        recipeId: recipeOne.id
      }
    });
  }


  // Add Instructions
  type Instruction = {
    stepNo: number;
    description: string;
  }
  let instructionsOne: Instruction[]  = [{
    stepNo: 1, 
    description: "Fry penuts until golden brown on low flame."
  }, {
    stepNo: 2,
    description: "Add seseme seeds, poppy seeds, methi seeds coconut and fry until everything turns golden brown."
  }, {
    stepNo: 3,
    description: "Add garlic, ginger and water along with the fried ingredients above and grind it to a fine paste."
  }, {
    stepNo: 4,
    description: "Add oil to the pan."
  },  {
    stepNo: 5,
    description: "Once the oil heats up, add chilli and saute it."
  }, {
    stepNo: 6,
    description: "Add mustard seeds, cumin seeds and fry until they splutter."
  }, {
    stepNo: 7,
    description: "Add curry leaves."
  }, {
    stepNo: 8,
    description: "Add Onions and fry till they are golden brown."
  }, {
    stepNo: 9,
    description: "Add turmuric, chilli powder, garam masala, coriander powder, cumin powder, salt and saute it."
  }, {
    stepNo: 10,
    description: "Add the Grinded pasted you prepared earlier."
  }, {
    stepNo: 11,
    description: "Cook the paste in medium flame for a couple of minutes."
  }, {
    stepNo: 12,
    description: "Add Tamirind juice."
  }, {
    stepNo: 13,
    description: "Add Bellam (Jaggery), water and mix."
  }, {
    stepNo: 15,
    description: "At this stage check for salt and chilli powder and add if needed."
  }, {
    stepNo: 16,
    description: "Close the lid and let the mixture Boil for 10 minutes until you notice the oil separate."
  }, {
    stepNo: 17,
    description: "Add coriander and let it cook for a couple of minutes."
  }, {
    stepNo: 18,
    description: "Turn off the stove and serve the curry."
  }
];

for(let instruction of instructionsOne) {
  await prisma.recipeInstruction.create({
    data: {
      stepNo: instruction.stepNo,
      description: instruction.description,
      recipeId: recipeOne.id
    }
  });
}




  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
