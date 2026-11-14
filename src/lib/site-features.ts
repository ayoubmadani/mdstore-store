/** مجموعات صفحة «المزايا» بترتيب عرضها. النصوص في messages/<lang>/features.json */
export const FEATURE_GROUP_IDS = [
  'store',
  'products',
  'landing',
  'orders',
  'protect',
  'confirm',
  'delivery',
  'stock',
  'profit',
  'tracking',
  'team',
  'app',
] as const;

export type FeatureGroupId = (typeof FEATURE_GROUP_IDS)[number];

export interface FeatureGroup {
  id: FeatureGroupId;
  title: string;
  desc: string;
  items: string[];
}

export interface FeatureStat {
  value: string;
  label: string;
}
