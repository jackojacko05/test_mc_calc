export interface Recipe {
  code: string;
  name: string;
  ingredients: { [materialCode: string]: number };
  madols: number;
}

export const recipes: Recipe[] = [
  {
    code: 'R001',
    name: 'ビリヤニ',
    ingredients: {
      M001: 1, // 辛味パウダー
      M006: 1, // 米
      M007: 1, // 玉ねぎ
      M005: 1, // 肉
    },
    madols: 1000,
  },
  {
    code: 'R002',
    name: 'ハラペーニョと鷹の爪ピザ',
    ingredients: {
      M001: 1, // 辛味パウダー
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M004: 1, // ピザソース
    },
    madols: 1000,
  },
  {
    code: 'R003',
    name: 'ジャンバラヤ',
    ingredients: {
      M001: 1, // 辛味パウダー
      M006: 1, // 米
      M007: 1, // 玉ねぎ
      M005: 1, // 肉
    },
    madols: 1000,
  },
  {
    code: 'R004',
    name: 'カレーライス',
    ingredients: {
      M001: 1, // 辛味パウダー
      M006: 1, // 米
      M007: 1, // 玉ねぎ
      M005: 1, // 肉
    },
    madols: 1000,
  },
  {
    code: 'R005',
    name: 'ペペロンチーノ',
    ingredients: {
      M001: 1, // 辛味パウダー
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M007: 1, // 玉ねぎ
    },
    madols: 1000,
  },
  {
    code: 'R006',
    name: 'ラザニア',
    ingredients: {
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M004: 1, // ピザソース
      M005: 1, // 肉
    },
    madols: 1000,
  },
  {
    code: 'R007',
    name: 'ミートソーススパゲッティ',
    ingredients: {
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M004: 1, // ピザソース
      M005: 1, // 肉
      M007: 1, // 玉ねぎ
    },
    madols: 1000,
  },
  {
    code: 'R008',
    name: 'ピザマルゲリータ',
    ingredients: {
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M004: 1, // ピザソース
    },
    madols: 800,
  },
  {
    code: 'R009',
    name: 'ナポリタン',
    ingredients: {
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M004: 1, // ピザソース
      M007: 1, // 玉ねぎ
    },
    madols: 800,
  },
  {
    code: 'R010',
    name: 'ドリア',
    ingredients: {
      M002: 1, // 小麦粉
      M003: 1, // チーズ
      M006: 1, // 米
      M005: 1, // 肉
    },
    madols: 800,
  },
  {
    code: 'R011',
    name: 'リゾット',
    ingredients: {
      M003: 1, // チーズ
      M006: 1, // 米
      M005: 1, // 肉
      M007: 1, // 玉ねぎ
    },
    madols: 800,
  },
  {
    code: 'R012',
    name: 'オムライス',
    ingredients: {
      M006: 1, // 米
      M005: 1, // 肉
      M007: 1, // 玉ねぎ
    },
    madols: 600,
  },
  {
    code: 'R013',
    name: 'チーズリゾット',
    ingredients: {
      M003: 1, // チーズ
      M006: 1, // 米
      M007: 1, // 玉ねぎ
    },
    madols: 600,
  },
  {
    code: 'R014',
    name: 'アラビアータ',
    ingredients: {
      M001: 1, // 辛味パウダー
      M002: 1, // 小麦粉
      M004: 1, // ピザソース
      M007: 1, // 玉ねぎ
    },
    madols: 1000,
  },
  {
    code: 'R015',
    name: 'エビチリ',
    ingredients: {
      M001: 1, // 辛味パウダー
      M005: 1, // 肉（この場合はエビ）
      M007: 1, // 玉ねぎ
    },
    madols: 1000,
  },
  {
    code: 'R016',
    name: 'カレー',
    ingredients: {
      M001: 1, // 辛味パウダー
      M005: 1, // 肉
      M006: 1, // 米
      M007: 1, // 玉ねぎ
    },
    madols: 1000,
  },
];
