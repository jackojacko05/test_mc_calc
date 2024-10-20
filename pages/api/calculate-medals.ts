import { NextApiRequest, NextApiResponse } from 'next';

type Material = 'spicyPowder' | 'flour' | 'cheese' | 'pizzaSauce' | 'meat' | 'rice' | 'onion';
type Quality = 'high' | 'medium' | 'low';

type Stock = {
  [K in Material]: {
    [Q in Quality]: number;
  };
};

interface Recipe {
  name: string;
  ingredients: {
    [K in Material]?: number;
  };
}

const recipes: Recipe[] = [
  {
    name: 'ビリヤニ',
    ingredients: {
      spicyPowder: 1,
      rice: 1,
      onion: 1,
      meat: 1,
    },
  },
  {
    name: 'ハラペーニョと鷹の爪ピザ',
    ingredients: {
      spicyPowder: 1,
      flour: 1,
      cheese: 1,
      pizzaSauce: 1,
    },
  },
];

const qualityPoints: { [K in Quality]: number } = {
  high: 30,
  medium: 20,
  low: 10,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const stock = req.body as Stock;
    const result = calculateOptimalRecipes(stock);
    res.status(200).json(result);
  } else {
    res.status(405).end();
  }
}

function calculateOptimalRecipes(stock: Stock): { recipes: { [name: string]: number }, medals: number } {
  let optimalRecipes: { [name: string]: number } = {};
  let maxMedals = 0;
  let currentStock = JSON.parse(JSON.stringify(stock)) as Stock;

  while (true) {
    let bestRecipe: string | null = null;
    let bestMedals = 0;

    for (const recipe of recipes) {
      if (canMake(currentStock, recipe.ingredients)) {
        const medals = calculateMedalsForRecipe(currentStock, recipe.ingredients);
        if (medals > bestMedals) {
          bestMedals = medals;
          bestRecipe = recipe.name;
        }
      }
    }

    if (bestRecipe === null) break;

    optimalRecipes[bestRecipe] = (optimalRecipes[bestRecipe] || 0) + 1;
    maxMedals += bestMedals;
    useIngredients(currentStock, recipes.find(r => r.name === bestRecipe)!.ingredients);
  }

  return { recipes: optimalRecipes, medals: maxMedals };
}

function canMake(stock: Stock, ingredients: Recipe['ingredients']): boolean {
  for (const material in ingredients) {
    const materialKey = material as Material;
    const requiredAmount = ingredients[materialKey] || 0;
    if (requiredAmount > 0) {
      const availableQuantity = Object.values(stock[materialKey]).reduce((sum, qty) => sum + qty, 0);
      if (availableQuantity < requiredAmount) {
        return false;
      }
    }
  }
  return true;
}

function calculateMedalsForRecipe(
  stock: Stock,
  ingredients: Recipe['ingredients']
): number {
  let totalMedals = 0;
  for (const material in ingredients) {
    const materialKey = material as Material;
    const requiredAmount = ingredients[materialKey] || 0;
    if (requiredAmount > 0) {
      let remainingAmount = requiredAmount;
      for (const quality in qualityPoints) {
        const qualityKey = quality as Quality;
        const availableQuantity = stock[materialKey][qualityKey];
        const usedQuantity = Math.min(availableQuantity, remainingAmount);
        totalMedals += qualityPoints[qualityKey] * usedQuantity;
        remainingAmount -= usedQuantity;
        if (remainingAmount <= 0) break;
      }
    }
  }
  return totalMedals;
}

function useIngredients(stock: Stock, ingredients: Recipe['ingredients']): void {
  for (const material in ingredients) {
    const materialKey = material as Material;
    const requiredAmount = ingredients[materialKey] || 0;
    if (requiredAmount > 0) {
      let remainingAmount = requiredAmount;
      for (const quality in qualityPoints) {
        const qualityKey = quality as Quality;
        const availableQuantity = stock[materialKey][qualityKey];
        const usedQuantity = Math.min(availableQuantity, remainingAmount);
        stock[materialKey][qualityKey] -= usedQuantity;
        remainingAmount -= usedQuantity;
        if (remainingAmount <= 0) break;
      }
    }
  }
}
