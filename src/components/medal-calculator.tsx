'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MedalCalculatorComponent() {
  const [result, setResult] = useState<{ recipes: { [name: string]: number }, medals: number } | null>(null);

  const calculateMedals = async () => {
    // ここで在庫データを準備します。実際の実装では、フォームからユーザー入力を受け取るなどの方法を使用します。
    const stock = {
      spicyPowder: { high: 5, medium: 3, low: 2 },
      flour: { high: 4, medium: 2, low: 1 },
      cheese: { high: 3, medium: 3, low: 3 },
      pizzaSauce: { high: 2, medium: 4, low: 1 },
      meat: { high: 3, medium: 2, low: 2 },
      rice: { high: 4, medium: 3, low: 2 },
      onion: { high: 3, medium: 3, low: 3 },
    };

    try {
      const response = await fetch('/api/calculate-medals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stock),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error calculating medals:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 twisted-wonderland-bg">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gold twisted-wonderland-font">メダル計算機</h1>
        <Button 
          onClick={calculateMedals}
          className="w-full bg-gold hover:bg-gold-dark text-black transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg twisted-wonderland-font"
        >
          計算する
        </Button>
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
    </div>
  );
}
