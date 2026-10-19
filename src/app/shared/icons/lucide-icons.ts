import {
  LucideArchive,
  LucideArchiveRestore,
  LucideArrowLeft,
  LucideArrowLeftRight,
  LucideBanknote,
  LucideCar,
  LucideCircleDot,
  LucideClapperboard,
  LucideGraduationCap,
  LucideHeartPulse,
  LucideHouse,
  LucideLandmark,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucidePencil,
  LucidePlus,
  LucideReceipt,
  LucideSearch,
  LucideShoppingBag,
  LucideTags,
  LucideTrash,
  LucideUser,
  LucideUsers,
  LucideUtensils,
  LucideWallet,
  LucideX,
  provideLucideIcons,
} from '@lucide/angular';

/** App-wide Lucide set for shell, lists, and category icon keys. */
export function provideAppLucideIcons() {
  return provideLucideIcons(
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucideTrash,
    LucideArrowLeft,
    LucideArchive,
    LucideArchiveRestore,
    LucideMenu,
    LucideX,
    LucideLayoutDashboard,
    LucideWallet,
    LucideBanknote,
    LucideArrowLeftRight,
    LucideTags,
    LucideUsers,
    LucideLandmark,
    LucideUser,
    LucideLogOut,
    LucideUtensils,
    LucideCar,
    LucideHouse,
    LucideHeartPulse,
    LucideShoppingBag,
    LucideReceipt,
    LucideGraduationCap,
    LucideClapperboard,
    LucideCircleDot,
  );
}

/** Map expense-api category iconKey values to Lucide kebab names. */
export const CATEGORY_ICON_KEYS: Record<string, string> = {
  food: 'utensils',
  transport: 'car',
  home: 'house',
  health: 'heart-pulse',
  shopping: 'shopping-bag',
  bills: 'receipt',
  education: 'graduation-cap',
  entertainment: 'clapperboard',
  other: 'circle-dot',
};

export function categoryLucideName(iconKey: string | null | undefined): string {
  if (!iconKey) {
    return 'circle-dot';
  }
  return CATEGORY_ICON_KEYS[iconKey] ?? 'circle-dot';
}
