import { useEffect, useMemo, useState } from 'react';
import type { SharedLocation } from '@/types';

function haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number {
    const R = 6371; // Earth radius in km
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

type Coords = { lat: number; lng: number } | null;

export function useSortedLocations(locations: SharedLocation[]) {
    const [userCoords, setUserCoords] = useState<Coords>(null);

    useEffect(() => {
        if (
            typeof navigator === 'undefined' ||
            !navigator.geolocation ||
            locations.length === 0
        ) {
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {},
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        );
    }, [locations.length]);

    const { sortedLocations, getDistanceKm } = useMemo(() => {
        const withCoords = locations.filter(
            (loc): loc is SharedLocation & { lat: number; lng: number } =>
                loc.lat != null && loc.lng != null,
        );
        const withoutCoords = locations.filter(
            (loc) => loc.lat == null || loc.lng == null,
        );

        if (!userCoords) {
            return {
                sortedLocations: locations,
                getDistanceKm: (): number | null => null,
            };
        }

        const withDistance = withCoords.map((loc) => ({
            loc,
            km: haversineKm(userCoords.lat, userCoords.lng, loc.lat, loc.lng),
        }));
        withDistance.sort((a, b) => a.km - b.km);
        const sorted = [...withDistance.map((x) => x.loc), ...withoutCoords];

        const kmMap = new Map<string, number>();
        withDistance.forEach(({ loc, km }) => kmMap.set(loc.name, km));

        return {
            sortedLocations: sorted,
            getDistanceKm: (loc: SharedLocation): number | null =>
                kmMap.get(loc.name) ?? null,
        };
    }, [locations, userCoords]);

    return { sortedLocations, getDistanceKm };
}
