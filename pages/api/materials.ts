import { NextApiRequest, NextApiResponse } from 'next';
import { getSheetData } from '@/lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Fetching materials data');
    const materials = await getSheetData('Materials');
    console.log('Materials data fetched successfully:', materials);
    res.status(200).json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ 
      error: 'Failed to fetch materials', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
