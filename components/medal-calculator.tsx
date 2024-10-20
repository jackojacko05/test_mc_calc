'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Material = 'spicyPowder' | 'flour' | 'cheese' | 'pizzaSauce' | 'meat' | 'rice' | 'onion'
type Quality = 'high' | 'medium' | 'low'

interface Stock {
  [key: Material]: {
    [key in Quality]: number
  }
}

export function MedalCalculatorComponent() {
  const [stock, setStock] = useState<Stock>({
    spicyPowder: { high: 0, medium: 0, low: 0 },
    flour: { high: 0, medium: 0, low: 0 },
    cheese: { high: 0, medium: 0, low: 0 },
    pizzaSauce: { high: 0, medium: 0, low: 0 },
    meat: { high: 0, medium: 0, low: 0 },
    rice: { high: 0, medium: 0, low: 0 },
    onion: { high: 0, medium: 0, low: 0 },
  })
  const [result, setResult] = useState<{ bestRecipe: string; medals: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (material: Material, quality: Quality, value: string) => {
    setStock(prevStock => ({
      ...prevStock,
      [material]: {
        ...prevStock[material],
        [quality]: parseInt(value) || 0
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/calculate-medals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (error) {
      console.error('Error calculating medals:', error)
      setError(error instanceof Error ? error.message : '計算中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  const materials: { id: Material; name: string }[] = [
    { id: 'spicyPowder', name: '辛味パウダー' },
    { id: 'flour', name: '小麦粉' },
    { id: 'cheese', name: 'チーズ' },
    { id: 'pizzaSauce', name: 'ピザソース' },
    { id: 'meat', name: '肉' },
    { id: 'rice', name: '米' },
    { id: 'onion', name: '玉ねぎ' },
  ]

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
                <div key={material.id} className="bg-black bg-opacity-50 p-4 rounded-md border border-gold">
                  <h3 className="text-xl mb-2 text-gold twisted-wonderland-font">{material.name}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['high', 'medium', 'low'] as const).map(quality => (
                      <div key={quality}>
                        <Label htmlFor={`${material.id}-${quality}`} className="text-sm text-light-gold mb-1 block">
                          {quality === 'high' ? '高品質' : quality === 'medium' ? '中品質' : '低品質'}
                        </Label>
                        <Input
                          id={`${material.id}-${quality}`}
                          type="number"
                          min="0"
                          value={stock[material.id][quality]}
                          onChange={(e) => handleInputChange(material.id, quality, e.target.value)}
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
              {Object.entries(result.recipes).map(([recipe, count]) => (
                <p key={recipe} className="text-lg">
                  <span className="font-bold text-gold">{recipe}</span>: {count}回
                </p>
              ))}
              <p className="text-lg mt-4">合計メダル数: <span className="font-bold text-gold">{result.medals}</span></p>
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
