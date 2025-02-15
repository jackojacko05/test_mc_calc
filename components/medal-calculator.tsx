'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Quality = 'high' | 'medium' | 'low'

interface Material {
  code: string;
  name: string;
}

interface Recipe {
  code: string;
  name: string;
  ingredients: { [materialCode: string]: number };
  madols: number;
}

interface Stock {
  [code: string]: {
    [key in Quality]: number
  }
}

interface UsedMaterialDetail {
  materialCode: string;
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

interface CalculationResult {
  recipes: { [name: string]: number };
  medals: number;
  madols: number;
  charcoalDetails?: { materials: [string, string], count: number }[];
  recipeDetails: RecipeDetail[];
}

export function MedalCalculatorComponent() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [stock, setStock] = useState<Stock>({})
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsResponse, recipesResponse] = await Promise.all([
          fetch('/api/materials'),
          fetch('/api/recipes')
        ]);

        if (!materialsResponse.ok || !recipesResponse.ok) {
          const materialsError = await materialsResponse.text();
          const recipesError = await recipesResponse.text();
          throw new Error(`データの取得に失敗しました。Materials: ${materialsError}, Recipes: ${recipesError}`);
        }

        const materialsData: Material[] = await materialsResponse.json();
        const recipesData: Recipe[] = await recipesResponse.json();

        setMaterials(materialsData);
        setRecipes(recipesData);
        
        // 初期の在庫状態を設定
        const initialStock: Stock = {};
        materialsData.forEach(material => {
          initialStock[material.code] = { high: 0, medium: 0, low: 0 };
        });
        setStock(initialStock);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'データの読み込み中に不明なエラーが発生しました');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (materialCode: string, quality: Quality, value: string) => {
    // 入力値を事前に変換
    const numValue = parseInt(value) || 0;
    
    // React の状態更新を最適化
    setStock(prevStock => {
      const newStock = { ...prevStock };
      if (!newStock[materialCode]) {
        newStock[materialCode] = { high: 0, medium: 0, low: 0 };
      }
      newStock[materialCode] = {
        ...newStock[materialCode],
        [quality]: numValue
      };
      return newStock;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    console.log('Submitting data:', { stock, recipes });

    try {
      const response = await fetch('/api/calculate-medals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock, recipes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)

      if ('error' in data) {
        throw new Error(data.error as string)
      }

      setResult(data)
    } catch (error) {
      console.error('Error calculating medals:', error)
      setError(error instanceof Error ? error.message : '計算中にエラー発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 twisted-wonderland-bg">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-dark-gray text-white p-6 rounded-lg shadow-lg mb-8 border border-gold">
          <CardHeader>
            <CardTitle className="text-2xl text-gold twisted-wonderland-font">食材在庫</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {materials.map(material => (
                <div key={material.code} className="bg-black bg-opacity-50 p-4 rounded-md border border-gold">
                  <h3 className="text-xl mb-2 text-gold twisted-wonderland-font">{material.name}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['high', 'medium', 'low'] as const).map(quality => (
                      <div key={quality}>
                        <Label htmlFor={`${material.code}-${quality}`} className="text-sm text-light-gold mb-1 block">
                          {quality === 'high' ? '高品質' : quality === 'medium' ? '中品質' : '低品質'}
                        </Label>
                        <Input
                          id={`${material.code}-${quality}`}
                          type="number"
                          min="0"
                          value={stock[material.code]?.[quality] || 0}
                          onChange={(e) => handleInputChange(material.code, quality, e.target.value)}
                          className="bg-dark-gray border-gold text-white focus:ring-gold focus:border-gold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button 
                type="submit" 
                className="w-full bg-gold hover:bg-gold-dark text-black transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg twisted-wonderland-font"
                disabled={isLoading}
              >
                {isLoading ? '計算中...' : '計算'}
              </Button>
            </form>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive" className="mt-6 bg-red-900 border-red-500 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="twisted-wonderland-font">エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <Card className="mt-6 bg-dark-gray text-white p-6 rounded-lg shadow-lg border border-gold">
            <CardHeader>
              <CardTitle className="text-2xl text-gold twisted-wonderland-font">計算結果</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4 text-gold twisted-wonderland-font">最適なレシピの組み合わせ:</h2>
              
              {result.recipeDetails.map((detail, index) => (
                <div key={index} className="mb-6 bg-dark-gray p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gold mb-2">{detail.recipeName}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-4 py-2 text-left text-light-gold">食材</th>
                          <th className="px-4 py-2 text-center text-light-gold">高品質</th>
                          <th className="px-4 py-2 text-center text-light-gold">中品質</th>
                          <th className="px-4 py-2 text-center text-light-gold">低品質</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.materials.map((material, mIndex) => (
                          <tr key={mIndex} className="border-b border-gray-700">
                            <td className="px-4 py-2">
                              {materials.find(m => m.code === material.materialCode)?.name}
                            </td>
                            <td className="px-4 py-2 text-center">{material.high}</td>
                            <td className="px-4 py-2 text-center">{material.medium}</td>
                            <td className="px-4 py-2 text-center">{material.low}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    獲得メダル: {detail.medals} / 獲得マドル: {detail.madols}
                  </div>
                </div>
              ))}

              {result.charcoalDetails && (
                <div className="mb-6 bg-dark-gray p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gold mb-2">炭</h3>
                  {result.charcoalDetails.map((detail, index) => (
                    <p key={index} className="text-sm text-gray-300">
                      {materials.find(m => m.code === detail.materials[0])?.name} + {' '}
                      {materials.find(m => m.code === detail.materials[1])?.name}: {detail.count}回
                    </p>
                  ))}
                  <div className="mt-2 text-sm text-gray-300">
                    獲得メダル: 3 / 獲得マドル: 350
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-dark-gray rounded-lg">
                <p className="text-lg">合計メダル数(期待値): <span className="font-bold text-gold">{result.medals}</span></p>
                <p className="text-lg">合計マドル数: <span className="font-bold text-gold">{result.madols}</span></p>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p className="mb-2">
            作成者: <a href="https://twitter.com/jackojacko_" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-light-gold">@jackojacko_</a> / <a href="https://github.com/jackojacko05/twst_mc_calc" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-light-gold">GitHub</a>
          </p>
          <p>
            改善点はTwitterのDM、ないしGitHubへの直接のPRも歓迎です
          </p>
        </div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        
        .twisted-wonderland-font {
          font-family: 'Playfair Display', serif;
        }
        
        .twisted-wonderland-bg {
          background-image: linear-gradient(45deg, #000 25%, transparent 25%),
                            linear-gradient(-45deg, #000 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #000 75%),
                            linear-gradient(-45deg, transparent 75%, #000 75%);
          background-size: 20px 20px;
          background-color: #1a1a1a;
        }
        
        .text-gold {
          color: #d4af37;
        }
        
        .text-light-gold {
          color: #f1c40f;
        }
        
        .bg-gold {
          background-color: #d4af37;
        }
        
        .bg-dark-gray {
          background-color: #2a2a2a;
        }
        
        .border-gold {
          border-color: #d4af37;
        }
        
        .hover\:bg-gold-dark:hover {
          background-color: #b8860b;
        }
      `}</style>
    </div>
  )
}
