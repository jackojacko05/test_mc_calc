import { NextApiRequest, NextApiResponse } from 'next';
import { Recipe } from '@/data/recipes';
import { getSheetData } from '@/lib/googleSheets';
import { materials } from '@/data/materials';

type Material = typeof materials[number]['code'];
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

// 審査員の評価基準を定義
type JudgeType = 'generous' | 'slightly_generous' | 'normal' | 'strict';

interface Judge {
  type: JudgeType;
  evaluate: (averagePoints: number) => number;
}

interface JudgeConfig {
  strictness: JudgeType;
  number: number;
}

// strictnessの数値を評価タイプに変換する関数
function getJudgeType(strictness: number): JudgeType {
  switch (strictness) {
    case 1:
      return 'generous';
    case 2:
      return 'slightly_generous';
    case 3:
      return 'normal';
    case 4:
      return 'strict';
    default:
      return 'normal';
  }
}

// judges配列を動的に生成する関数
async function getJudges(): Promise<Judge[]> {
  try {
    const judgeConfigs = await getSheetData('Judges');
    const judges: Judge[] = [];

    for (const config of judgeConfigs) {
      const count = parseInt(config.number.toString());
      const strictness = parseInt(config.strictness.toString());
      if (isNaN(count) || isNaN(strictness)) continue;

      const judgeType = getJudgeType(strictness);
      const judge: Judge = {
        type: judgeType,
        evaluate: (avg) => {
          switch (judgeType) {
            case 'generous':
              if (avg >= 16) return 10;
              if (avg === 15) return 9;
              if (avg >= 11) return 8;
              if (avg === 10) return 7;
              return 3;
            case 'slightly_generous':
              if (avg >= 20) return 10;
              if (avg >= 16) return 9;
              if (avg === 15) return 8;
              if (avg >= 11) return 7;
              if (avg === 10) return 6;
              return 3;
            case 'normal':
              if (avg >= 21) return 10;
              if (avg === 20) return 9;
              if (avg >= 16) return 8;
              if (avg === 15) return 7;
              if (avg >= 11) return 6;
              if (avg === 10) return 5;
              return 3;
            case 'strict':
              if (avg >= 26) return 10;
              if (avg === 25) return 9;
              if (avg >= 21) return 8;
              if (avg === 20) return 7;
              if (avg >= 16) return 6;
              if (avg === 15) return 5;
              if (avg >= 11) return 4;
              if (avg === 10) return 3;
              return 3;
            default:
              return 3;
          }
        }
      };

      // 指定された数だけjudgeを追加
      for (let i = 0; i < count; i++) {
        judges.push(judge);
      }
    }

    console.log('Loaded judges:', judges.map(j => j.type));
    return judges;
  } catch (error) {
    console.error('Error loading judges:', error);
    throw error;
  }
}

interface CharcoalResult {
  usedIngredients: { [key in Material]: number };
  combinations: { materials: [Material, Material], count: number }[];
}

interface UsedMaterialDetail {
  materialCode: Material;
  high: number;
  medium: number;
  low: number;
}

interface RecipeDetail {
  recipeName: string;
  count: number;
  materials: UsedMaterialDetail[];
  medals: number;
  madols: number;
}

interface ParsedRecipe extends Recipe {
  ingredients: { [key in Material]: number };
}

// APIハンドラーを非同期関数に変更
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

      // 審査員の構成を読み込む
      const judges = await getJudges();
      
      // レシピの ingredients を解析
      const parsedRecipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        madols: parseInt(recipe.madols)
      }));

      const result = calculateOptimalRecipes(stock, parsedRecipes, judges);
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

// calculateOptimalRecipes関数を修正して judges を引数として受け取る
function calculateOptimalRecipes(
  stock: Stock, 
  recipes: ParsedRecipe[], 
  judges: Judge[]
): {
  recipes: { [name: string]: number };
  medals: number;
  madols: number;
  charcoalDetails?: { materials: [Material, Material], count: number }[];
  recipeDetails: RecipeDetail[];
} {
  let optimalRecipes: { [name: string]: number } = {};
  let totalMedals = 0;
  let totalMadols = 0;
  let charcoalDetails: { materials: [Material, Material], count: number }[] = [];
  let recipeDetails: RecipeDetail[] = [];
  let currentStock = JSON.parse(JSON.stringify(stock)) as Stock;

  while (true) {
    let bestRecipe: any | null = null;
    let bestMedals = 0;
    let bestUsedMaterials: UsedMaterialDetail[] | null = null;

    // 通常のシピを試す
    for (const recipe of recipes) {
      if (canMake(currentStock, recipe.ingredients)) {
        // 各レシピに対して、低品質優先と高品質優先の両方を試す
        const lowQualityFirst = simulateRecipe(currentStock, recipe, true, judges);
        const highQualityFirst = simulateRecipe(currentStock, recipe, false, judges);

        // より多くのメダルが獲得できる方を選択
        if (lowQualityFirst.medals > bestMedals) {
          bestMedals = lowQualityFirst.medals;
          bestRecipe = recipe;
          bestUsedMaterials = lowQualityFirst.materials;
        }
        if (highQualityFirst.medals > bestMedals) {
          bestMedals = highQualityFirst.medals;
          bestRecipe = recipe;
          bestUsedMaterials = highQualityFirst.materials;
        }
      }
    }

    // レシピが見つからない場合は炭を作る処理（既存のコド）
    if (bestRecipe === null) {
      const charcoalResult = tryMakeCharcoal(currentStock);
      if (charcoalResult) {
        console.log('Making charcoal with remaining materials');
        optimalRecipes['炭'] = (optimalRecipes['炭'] || 0) + charcoalResult.combinations[0].count;
        totalMedals += 3 * charcoalResult.combinations[0].count;
        totalMadols += 350 * charcoalResult.combinations[0].count;
        charcoalDetails.push(...charcoalResult.combinations);
        useIngredients(currentStock, charcoalResult.usedIngredients);
        continue;
      }
      break;
    }

    // 選択されたレシピの実行
    if (bestUsedMaterials) {
      // 使用する材料を在庫から減らす
      for (const material of bestUsedMaterials) {
        const materialStock = currentStock[material.materialCode as Material];
        if (materialStock) {
          materialStock.high -= material.high;
          materialStock.medium -= material.medium;
          materialStock.low -= material.low;
        }
      }

      recipeDetails.push({
        recipeName: bestRecipe.name,
        count: 1,
        materials: bestUsedMaterials,
        medals: bestMedals,
        madols: bestRecipe.madols
      });

      optimalRecipes[bestRecipe.name] = (optimalRecipes[bestRecipe.name] || 0) + 1;
      totalMedals += bestMedals;
      totalMadols += bestRecipe.madols;
    }
  }

  return { 
    recipes: optimalRecipes, 
    medals: totalMedals, 
    madols: totalMadols,
    charcoalDetails: charcoalDetails.length > 0 ? charcoalDetails : undefined,
    recipeDetails
  };
}

// simulateRecipe関数を修正して judges を引数として受け取る
function simulateRecipe(
  stock: Stock,
  recipe: any,
  lowQualityFirst: boolean,
  judges: Judge[]
): { medals: number, materials: UsedMaterialDetail[] } {
  const tempStock = JSON.parse(JSON.stringify(stock));
  const usedMaterials: UsedMaterialDetail[] = [];
  let totalPoints = 0;
  let totalIngredients = 0;

  for (const materialCode in recipe.ingredients) {
    const requiredAmount = recipe.ingredients[materialCode];
    if (requiredAmount > 0) {
      const materialStock = tempStock[materialCode as Material];
      const detail: UsedMaterialDetail = {
        materialCode,
        high: 0,
        medium: 0,
        low: 0
      };

      let remainingAmount = requiredAmount;
      const qualities = lowQualityFirst 
        ? ['low', 'medium', 'high'] as Quality[]
        : ['high', 'medium', 'low'] as Quality[];

      for (const quality of qualities) {
        const availableQuantity = materialStock[quality];
        const usedQuantity = Math.min(availableQuantity, remainingAmount);
        detail[quality] = usedQuantity;
        totalPoints += qualityPoints[quality] * usedQuantity;
        remainingAmount -= usedQuantity;
        if (remainingAmount <= 0) break;
      }

      totalIngredients += requiredAmount;
      usedMaterials.push(detail);
    }
  }

  const averagePoints = Math.floor(totalPoints / totalIngredients);
  const allJudgesPoints = judges.map(judge => judge.evaluate(averagePoints));
  const totalScore = allJudgesPoints.reduce((sum, points) => sum + points, 0);
  const medals = Math.max(Math.floor((totalScore * 30) / 100), 3);

  return { medals, materials: usedMaterials };
}

// 炭を作れるか確認し、作れる場合は使用する材料を返す
function tryMakeCharcoal(stock: Stock): CharcoalResult | null {
  let availableMaterials: { code: Material, quantity: number }[] = [];

  // 利用可能な材料とその数量を集計
  for (const materialCode in stock) {
    const materialStock = stock[materialCode as Material];
    const totalQuantity = Object.values(materialStock).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (totalQuantity >= 1) {
      availableMaterials.push({ 
        code: materialCode as Material, 
        quantity: totalQuantity 
      });
    }
  }

  // 2種類以上の材料がない場合は炭を作れない
  if (availableMaterials.length < 2) {
    return null;
  }

  // 材料の組み合わせを作成
  const combinations: { materials: [Material, Material], count: number }[] = [];
  const usedIngredients: { [key in Material]?: number } = {};

  // 最初の2つの材料を使用して炭を作る
  const material1 = availableMaterials[0];
  const material2 = availableMaterials[1];
  
  // 両方の材料の最小値を取得（これが作れる炭の数）
  const charcoalCount = Math.min(material1.quantity, material2.quantity);
  
  combinations.push({
    materials: [material1.code, material2.code],
    count: charcoalCount
  });

  usedIngredients[material1.code] = charcoalCount;
  usedIngredients[material2.code] = charcoalCount;

  return { 
    usedIngredients: usedIngredients as { [key: string]: number }, 
    combinations 
  };
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

