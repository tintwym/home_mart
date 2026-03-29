export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedCategory = {
    id: string;
    name: string;
    slug: string;
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
