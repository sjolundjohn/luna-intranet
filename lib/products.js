// Product catalog - scraped from kegjoy.com
// Easy to update when new products are added

export const products = {
  kombucha: {
    name: 'Kombucha',
    icon: '🍵',
    brands: [
      {
        id: 'gts',
        name: "GT's Kombucha",
        flavors: [
          'Trilogy',
          'Gingerade',
          'Watermelon Wonder',
          'Island Bliss',
          'Strawberry Serenity',
          'Golden Pineapple',
          'Peach Paradise',
          'Pure (Original)',
        ],
      },
      {
        id: 'health-ade',
        name: 'Health-Ade Kombucha',
        flavors: [
          'Pink Lady Apple',
          'Pomegranate',
          'Berry Lemonade',
          'Tangerine-Passionfruit',
        ],
      },
      {
        id: 'mightybooch',
        name: 'MightyBooch Kombucha',
        flavors: ['Contact vendor for flavors'],
      },
      {
        id: 'marin',
        name: 'Marin Kombucha',
        flavors: ['Contact vendor for flavors'],
      },
      {
        id: 'babe',
        name: 'Babe Kombucha',
        flavors: ['Contact vendor for flavors'],
      },
      {
        id: 'bambucha',
        name: 'Bambucha Kombucha',
        flavors: ['Contact vendor for flavors'],
      },
    ],
  },
  coldBrew: {
    name: 'Cold Brew Coffee',
    icon: '☕',
    brands: [
      {
        id: 'cwj',
        name: 'Commonwealth Joe Nitro Cold Brew',
        flavors: ['NITRO Coffee (Medium Blend)'],
      },
      {
        id: 'bona-fide',
        name: 'Bona Fide Craft Draft Coffee',
        flavors: ['Contact vendor for flavors'],
      },
      {
        id: 'groundwork',
        name: 'Groundwork Cold Brew',
        flavors: ['Contact vendor for flavors'],
      },
      {
        id: 'steeping-giant',
        name: 'Steeping Giant Cold Brew',
        flavors: ['Contact vendor for flavors'],
      },
    ],
  },
};

export const vendorEmail = 'orders@kegjoy.com';
export const vendorPhone = '760.683.9208';
