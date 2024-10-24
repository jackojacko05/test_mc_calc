import { NextApiRequest, NextApiResponse } from 'next';
import { getSheetData } from '@/lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const recipes = await getSheetData('Recipes');
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}
