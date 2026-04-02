export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedCategory = {
    id: string;
    name: string;
    slug: string;
    /** Parent category ULID when this row is a subcategory; null for top-level categories. */
    category_id?: string | null;
    /** Same as `id` for subcategory rows; null for top-level categories. */
    subcategory_id?: string | null;
};

export type SharedCategoryTreeNode = SharedCategory & {
    children?: SharedCategory[];
};

export type SharedLocation = {
    name: string;
    lat: number | null;
    lng: number | null;
};

export type SharedCurrency = {
    code: string;
    symbol: string;
    decimals: number;
};

export type SharedCurrenciesMap = Record<string, SharedCurrency>;

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    categories: SharedCategory[];
    categoryTree?: SharedCategoryTreeNode[];
    locations: SharedLocation[];
    regionLabel?: string;
    region?: string;
    currency?: SharedCurrency;
    currencies?: SharedCurrenciesMap;
    searchQuery?: string;
    locale?: string;
    translations?: Record<string, string>;
    [key: string]: unknown;
};
