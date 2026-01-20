// Mock data para la plataforma de venta de beats

export const mockBeats = [
  {
    id: '1',
    name: 'Fire Trap',
    producer: 'V CLUB',
    bpm: 140,
    key: 'C Minor',
    mood: 'Agresivo',
    genre: 'Trap',
    duration: '3:24',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    tags: ['trap', 'hard', '808s'],
    prices: {
      basica: 29.99,
      premium: 79.99,
      exclusiva: 299.99
    },
    plays: 1523,
    sales: 34,
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    name: 'Reggaeton Caliente',
    producer: 'V CLUB',
    bpm: 95,
    key: 'A Minor',
    mood: 'Energético',
    genre: 'Reggaeton',
    duration: '3:12',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    tags: ['reggaeton', 'dembow', 'latino'],
    prices: {
      basica: 24.99,
      premium: 69.99,
      exclusiva: 249.99
    },
    plays: 2145,
    sales: 56,
    createdAt: '2025-01-20'
  },
  {
    id: '3',
    name: 'Smooth R&B Vibes',
    producer: 'V CLUB',
    bpm: 75,
    key: 'G Major',
    mood: 'Romántico',
    genre: 'R&B',
    duration: '3:45',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    tags: ['rnb', 'smooth', 'chill'],
    prices: {
      basica: 34.99,
      premium: 89.99,
      exclusiva: 349.99
    },
    plays: 987,
    sales: 23,
    createdAt: '2025-01-18'
  },
  {
    id: '4',
    name: 'Dark Drill',
    producer: 'V CLUB',
    bpm: 145,
    key: 'D Minor',
    mood: 'Oscuro',
    genre: 'Drill',
    duration: '2:58',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    tags: ['drill', 'dark', 'uk'],
    prices: {
      basica: 39.99,
      premium: 99.99,
      exclusiva: 399.99
    },
    plays: 1756,
    sales: 45,
    createdAt: '2025-01-22'
  },
  {
    id: '5',
    name: 'Boom Bap Classic',
    producer: 'V CLUB',
    bpm: 90,
    key: 'E Minor',
    mood: 'Old School',
    genre: 'Hip Hop',
    duration: '3:33',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    tags: ['boom bap', 'classic', '90s'],
    prices: {
      basica: 27.99,
      premium: 74.99,
      exclusiva: 279.99
    },
    plays: 2341,
    sales: 67,
    createdAt: '2025-01-10'
  },
  {
    id: '6',
    name: 'Melodic Trap',
    producer: 'V CLUB',
    bpm: 138,
    key: 'F# Minor',
    mood: 'Melódico',
    genre: 'Trap',
    duration: '3:18',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    tags: ['melodic', 'trap', 'emotional'],
    prices: {
      basica: 32.99,
      premium: 84.99,
      exclusiva: 319.99
    },
    plays: 1432,
    sales: 38,
    createdAt: '2025-01-25'
  },
  {
    id: '7',
    name: 'Afrobeat Summer',
    producer: 'V CLUB',
    bpm: 110,
    key: 'C Major',
    mood: 'Alegre',
    genre: 'Afrobeat',
    duration: '3:28',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    tags: ['afrobeat', 'summer', 'dance'],
    prices: {
      basica: 26.99,
      premium: 72.99,
      exclusiva: 269.99
    },
    plays: 1876,
    sales: 42,
    createdAt: '2025-01-12'
  },
  {
    id: '8',
    name: 'Lo-Fi Chill',
    producer: 'V CLUB',
    bpm: 85,
    key: 'B♭ Major',
    mood: 'Relajado',
    genre: 'Lo-Fi',
    duration: '2:45',
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400',
    tags: ['lofi', 'chill', 'study'],
    prices: {
      basica: 19.99,
      premium: 59.99,
      exclusiva: 199.99
    },
    plays: 3421,
    sales: 89,
    createdAt: '2025-01-08'
  }
];

export const licenseTypes = {
  basica: {
    name: 'Licencia Básica',
    features: [
      'Uso en plataformas de streaming',
      'Hasta 10,000 streams',
      'Distribución en redes sociales',
      'Tag en el beat (nombre del productor)',
      'Archivo MP3 de alta calidad'
    ],
    restrictions: [
      'No reventa del beat',
      'No para venta de copias físicas'
    ]
  },
  premium: {
    name: 'Licencia Premium',
    features: [
      'Uso comercial ilimitado',
      'Hasta 500,000 streams',
      'Venta de copias físicas (hasta 2,000)',
      'Sin tag en el beat',
      'Archivos MP3 + WAV',
      'Uso en videos de YouTube monetizados'
    ],
    restrictions: [
      'No reventa del beat'
    ]
  },
  exclusiva: {
    name: 'Licencia Exclusiva',
    features: [
      'Derechos exclusivos completos',
      'Streams ilimitados',
      'Venta física ilimitada',
      'Sin tag',
      'Todos los archivos (MP3, WAV, Stems)',
      'Contrato de compra total',
      'El beat se retira del catálogo',
      'Registro de derechos incluido'
    ],
    restrictions: []
  }
};

export const mockSales = [
  {
    id: 's1',
    beatId: '1',
    beatName: 'Fire Trap',
    buyerEmail: 'artist@example.com',
    licenseType: 'premium',
    amount: 79.99,
    paymentMethod: 'Stripe',
    date: '2025-02-01',
    status: 'completado'
  },
  {
    id: 's2',
    beatId: '8',
    beatName: 'Lo-Fi Chill',
    buyerEmail: 'producer@example.com',
    licenseType: 'basica',
    amount: 19.99,
    paymentMethod: 'PayPal',
    date: '2025-02-02',
    status: 'completado'
  },
  {
    id: 's3',
    beatId: '5',
    beatName: 'Boom Bap Classic',
    buyerEmail: 'rapper@example.com',
    licenseType: 'exclusiva',
    amount: 279.99,
    paymentMethod: 'Mercado Pago',
    date: '2025-02-03',
    status: 'completado'
  }
];

export const dashboardStats = {
  totalSales: 8450.50,
  totalBeats: 8,
  totalPlays: 15481,
  totalPurchases: 394,
  monthlyRevenue: 2340.00,
  topGenre: 'Trap',
  averagePrice: 21.45
};