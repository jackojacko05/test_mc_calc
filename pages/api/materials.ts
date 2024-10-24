import { NextApiRequest, NextApiResponse } from 'next';
import { materials } from '@/data/materials';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(materials);
}
