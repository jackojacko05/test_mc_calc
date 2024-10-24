import { NextApiRequest, NextApiResponse } from 'next';
import { Recipe } from '@/data/recipes';

type Material = 'M001' | 'M002' | 'M003' | 'M004' | 'M005' | 'M006' | 'M007' | 'M008' | 'M009' | 'M010' | 'M011' | 'M012' | 'M013' | 'M014' | 'M015' | 'M016';
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
    try {
      const { stock, recipes } = req.body;
      console.log('Received request:', JSON.stringify({ stock, recipes }, null, 2));

      if (!stock || !recipes || !Array.isArray(recipes)) {
        throw new Error('Invalid input data');
      }

      // レシピの ingredients を解析
      const parsedRecipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        madols: parseInt(recipe.madols)
      }));

      const result = calculateOptimalRecipes(stock, parsedRecipes);
      console.log('Calculation result:', JSON.stringify(result, null, 2));

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in calculate-medals:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  } else {
    res.status(405).end();
  }
}

function calculateOptimalRecipes(stock: Stock, recipes: any[]): { recipes: { [name: string]: number }, medals: number, madols: number } {
  console.log('Starting calculation with:', { stock, recipes });
  let optimalRecipes: { [name: string]: number } = {};
  let totalMedals = 0;
  let totalMadols = 0;
  let currentStock = JSON.parse(JSON.stringify(stock)) as Stock;

  while (true) {
    let bestRecipe: any | null = null;
    let bestMedals = 0;

    for (const recipe of recipes) {
      console.log('Checking recipe:', recipe.name);
      if (canMake(currentStock, recipe.ingredients)) {
        const medals = calculateMedalsForRecipe(currentStock, recipe.ingredients);
        console.log('Can make recipe:', recipe.name, 'with medals:', medals);
        if (medals > bestMedals) {
          bestMedals = medals;
          bestRecipe = recipe;
        }
      } else {
        console.log('Cannot make recipe:', recipe.name);
      }
    }

    if (bestRecipe === null) {
      console.log('No more recipes can be made');
      break;
    }

    console.log('Best recipe this round:', bestRecipe.name, 'with medals:', bestMedals);
    optimalRecipes[bestRecipe.name] = (optimalRecipes[bestRecipe.name] || 0) + 1;
    totalMedals += bestMedals;
    totalMadols += bestRecipe.madols;
    useIngredients(currentStock, bestRecipe.ingredients);
  }

  console.log('Calculation completed:', { optimalRecipes, totalMedals, totalMadols });
  return { recipes: optimalRecipes, medals: totalMedals, madols: totalMadols };
}

function canMake(stock: Stock, ingredients: any): boolean {
  for (const materialCode in ingredients) {
    const requiredAmount = parseInt(ingredients[materialCode]) || 0;
    if (requiredAmount > 0) {
      const materialStock = stock[materialCode as Material];
      if (!materialStock) {
        console.log('Material not found in stock:', materialCode);
        return false;
      }
      const availableQuantity = Object.values(materialStock).reduce((sum, qty) => sum + qty, 0);
      if (availableQuantity < requiredAmount) {
        console.log('Not enough material:', materialCode, 'Required:', requiredAmount, 'Available:', availableQuantity);
        return false;
      }
    }
  }
  return true;
}

function calculateMedalsForRecipe(
  stock: Stock,
  ingredients: any
): number {
  let totalMedals = 0;
  for (const materialCode in ingredients) {
    const requiredAmount = ingredients[materialCode] || 0;
    if (requiredAmount > 0) {
      let remainingAmount = requiredAmount;
      const materialStock = stock[materialCode as Material];
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
  console.log('Calculated medals for recipe:', totalMedals);
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
