export interface Recipe {
  id: string;
  name: string;
  ingredients: { [materialId: string]: number };
  medals: number;
}

export const recipes: Recipe[] = [
  {
    id: 'biryani',
    name: 'ビリヤニ',
    ingredients: {
      spicyPowder: 1,
      rice: 1,
      onion: 1,
      meat: 1,
    },
    medals: 100,
  },
  {
    id: 'jalapeno_pizza',
    name: 'ハラペーニョと鷹の爪ピザ',
    ingredients: {
      spicyPowder: 1,
      flour: 1,
      cheese: 1,
      pizzaSauce: 1,
    },
    medals: 100,
  },
  {
    id: 'jambalaya',
    name: 'ジャンバラヤ',
    ingredients: {
      spicyPowder: 1,
      rice: 1,
      onion: 1,
      meat: 1,
    },
    medals: 100,
  },
  {
    id: 'curry_rice',
    name: 'カレーライス',
    ingredients: {
      spicyPowder: 1,
      rice: 1,
      onion: 1,
      meat: 1,
    },
    medals: 100,
  },
  {
    id: 'peperoncino',
    name: 'ペペロンチーノ',
    ingredients: {
      spicyPowder: 1,
      flour: 1,
      cheese: 1,
      onion: 1,
    },
    medals: 100,
  },
  {
    id: 'lasagna',
    name: 'ラザニア',
    ingredients: {
      flour: 1,
      cheese: 1,
      pizzaSauce: 1,
      meat: 1,
    },
    medals: 100,
  },
  {
    id: 'meat_sauce_spaghetti',
    name: 'ミートソーススパゲッティ',
    ingredients: {
      flour: 1,
      cheese: 1,
      pizzaSauce: 1,
      meat: 1,
      onion: 1,
    },
    medals: 100,
  },
  {
    id: 'margherita_pizza',
    name: 'ピザマルゲリータ',
    ingredients: {
      flour: 1,
      cheese: 1,
      pizzaSauce: 1,
    },
    medals: 80,
  },
  {
    id: 'napolitan',
    name: 'ナポリタン',
    ingredients: {
      flour: 1,
      cheese: 1,
      pizzaSauce: 1,
      onion: 1,
    },
    medals: 80,
  },
  {
    id: 'doria',
    name: 'ドリア',
    ingredients: {
      flour: 1,
      cheese: 1,
      rice: 1,
      meat: 1,
    },
    medals: 80,
  },
  {
    id: 'risotto',
    name: 'リゾット',
    ingredients: {
      cheese: 1,
      rice: 1,
      meat: 1,
      onion: 1,
    },
    medals: 80,
  },
  {
    id: 'omurice',
    name: 'オムライス',
    ingredients: {
      rice: 1,
      meat: 1,
      onion: 1,
    },
    medals: 60,
  },
  {
    id: 'cheese_risotto',
    name: 'チーズリゾット',
    ingredients: {
      cheese: 1,
      rice: 1,
      onion: 1,
    },
    medals: 60,
  },
];
