export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    region?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    cartCount?: number;
    cartListingIds?: string[];
    chatUnreadCount?: number;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
