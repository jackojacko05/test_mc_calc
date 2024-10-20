import { useState } from 'react';
import type { NextPage } from 'next';

const Home: NextPage = () => {
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
    <div>
      <h1>メダル計算機</h1>
      <button onClick={calculateMedals}>計算する</button>
      {result && (
        <div>
          <h2>最適なレシピの組み合わせ:</h2>
          <ul>
            {Object.entries(result.recipes).map(([recipe, count]) => (
              <li key={recipe}>{recipe}: {count}回</li>
            ))}
          </ul>
          <p>合計メダル数: {result.medals}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
