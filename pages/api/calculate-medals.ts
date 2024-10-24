import { NextApiRequest, NextApiResponse } from 'next';
import { Recipe } from '@/data/recipes';

type Material = 'spicyPowder' | 'flour' | 'cheese' | 'pizzaSauce' | 'meat' | 'rice' | 'onion';
type Quality = 'high' | 'medium' | 'low';

type Stock = {
  [K in Material]: {
    [Q in Quality]: number;
  };
};

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
    const { stock, recipes } = req.body;
    const result = calculateOptimalRecipes(stock, recipes);
    res.status(200).json(result);
  } else {
    res.status(405).end();
  }
}

function calculateOptimalRecipes(stock: Stock, recipes: Recipe[]): { recipes: { [name: string]: number }, medals: number } {
  let optimalRecipes: { [name: string]: number } = {};
  let maxMedals = 0;
  let currentStock = JSON.parse(JSON.stringify(stock)) as Stock;

  while (true) {
    let bestRecipe: Recipe | null = null;
    let bestMedals = 0;

    for (const recipe of recipes) {
      if (canMake(currentStock, recipe.ingredients)) {
        const medals = calculateMedalsForRecipe(currentStock, recipe.ingredients);
        if (medals > bestMedals) {
          bestMedals = medals;
          bestRecipe = recipe;
        }
      }
    }

    if (bestRecipe === null) break;

    optimalRecipes[bestRecipe.name] = (optimalRecipes[bestRecipe.name] || 0) + 1;
    maxMedals += bestMedals;
    useIngredients(currentStock, bestRecipe.ingredients);
  }

  // 作成回数が0のレシピを除外
  Object.keys(optimalRecipes).forEach(key => {
    if (optimalRecipes[key] === 0) {
      delete optimalRecipes[key];
    }
  });

  return { recipes: optimalRecipes, medals: maxMedals };
}

function canMake(stock: Stock, ingredients: Recipe['ingredients']): boolean {
  for (const materialKey in ingredients) {
    const requiredAmount = ingredients[materialKey] || 0;
    if (requiredAmount > 0) {
      const materialStock = stock[materialKey as Material];
      if (!materialStock) return false;
      const availableQuantity = Object.values(materialStock).reduce((sum, qty) => sum + qty, 0);
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
  for (const materialKey in ingredients) {
    const requiredAmount = ingredients[materialKey] || 0;
    if (requiredAmount > 0) {
      let remainingAmount = requiredAmount;
      const materialStock = stock[materialKey as Material];
      if (materialStock) {
        for (const quality in qualityPoints) {
          const qualityKey = quality as Quality;
          const availableQuantity = materialStock[qualityKey];
          const usedQuantity = Math.min(availableQuantity, remainingAmount);
          totalMedals += qualityPoints[qualityKey] * usedQuantity;
          remainingAmount -= usedQuantity;
          if (remainingAmount <= 0) break;
        }
      }
    }
  }
  return totalMedals;
}

function useIngredients(stock: Stock, ingredients: Recipe['ingredients']): void {
  for (const materialKey in ingredients) {
    const requiredAmount = ingredients[materialKey] || 0;
    if (requiredAmount > 0) {
      let remainingAmount = requiredAmount;
      const materialStock = stock[materialKey as Material];
      if (materialStock) {
        for (const quality in qualityPoints) {
          const qualityKey = quality as Quality;
          const availableQuantity = materialStock[qualityKey];
          const usedQuantity = Math.min(availableQuantity, remainingAmount);
          materialStock[qualityKey] -= usedQuantity;
          remainingAmount -= usedQuantity;
          if (remainingAmount <= 0) break;
        }
      }
    }
  }
}
