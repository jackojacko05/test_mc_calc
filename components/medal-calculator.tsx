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

interface CalculationResult {
  recipes: { [name: string]: number };
  medals: number;
  madols: number;
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
        ])

        if (!materialsResponse.ok || !recipesResponse.ok) {
          throw new Error('データの取得に失敗しました')
        }

        const materialsData: Material[] = await materialsResponse.json()
        const recipesData: Recipe[] = await recipesResponse.json()

        setMaterials(materialsData)
        setRecipes(recipesData)
        
        // 初期の在庫状態を設定
        const initialStock: Stock = {}
        materialsData.forEach(material => {
          initialStock[material.code] = { high: 0, medium: 0, low: 0 }
        })
        setStock(initialStock)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('データの読み込み中にエラーが発生しました')
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (materialCode: string, quality: Quality, value: string) => {
    setStock(prevStock => ({
      ...prevStock,
      [materialCode]: {
        ...prevStock[materialCode],
        [quality]: parseInt(value) || 0
      }
    }))
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
      setError(error instanceof Error ? error.message : '計算中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 twisted-wonderland-bg">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gold twisted-wonderland-font">メダル計算機</h1>
        <Card className="bg-dark-gray text-white p-6 rounded-lg shadow-lg mb-8 border border-gold">
          <CardHeader>
            <CardTitle className="text-2xl text-gold twisted-wonderland-font">材料在庫</CardTitle>
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
              <h2 className="text-xl font-semibold mb-2 text-gold twisted-wonderland-font">最適なレシピの組み合わせ:</h2>
              {Object.entries(result.recipes).map(([recipeCode, count]) => {
                const recipe = recipes.find(r => r.code === recipeCode);
                return (
                  <p key={recipeCode} className="text-lg">
                    <span className="font-bold text-gold">{recipe?.name || recipeCode}</span>: {count}回
                  </p>
                );
              })}
              <p className="text-lg mt-4">合計メダル数: <span className="font-bold text-gold">{result.medals}</span></p>
              <p className="text-lg">合計マドル数: <span className="font-bold text-gold">{result.madols}</span></p>
            </CardContent>
          </Card>
        )}
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
