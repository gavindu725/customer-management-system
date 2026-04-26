import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { City, Country } from "@/types";

export function useCountries() {
    return useQuery({
        queryKey: ["countries"],
        queryFn: async () => {
            const { data } = await api.get<Country[]>("/master/countries");
            return data;
        },
        staleTime: Infinity, // master data rarely changes
    });
}

export function useCitiesByCountry(countryId: number | undefined) {
    return useQuery({
        queryKey: ["cities", "by-country", countryId],
        queryFn: async () => {
            const { data } = await api.get<City[]>(
                `/master/countries/${countryId}/cities`,
            );
            return data;
        },
        enabled: !!countryId,
        staleTime: Infinity,
    });
}

export function useAllCities() {
    return useQuery({
        queryKey: ["cities", "all"],
        queryFn: async () => {
            const { data } = await api.get<City[]>("/master/cities");
            return data;
        },
        staleTime: Infinity,
    });
}
