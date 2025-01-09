"use client";
import { organizeMenu, type OrganizedMenu } from "@/lib/organize-menu";
import type { MenuCategory, MenuItem } from "@/types/menu";
import type { Restaurant } from "@/types/restaurant";
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

type MenuContextType = {
    organizedMenu: OrganizedMenu[];
    isLoading: boolean;
    isFetching: boolean;
    apiUrl: string;
    items: MenuItem[];
    restaurantID: string;
    restaurant: Restaurant | undefined;
};

const RestaurantContext = createContext<MenuContextType | undefined>(undefined);

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error("useRestaurant must be used within a MenuProvider");
    }
    return context;
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("Missing API URL in environment variables");
    }

    if (!process.env.NEXT_PUBLIC_RESTAURANT_ID) {
        throw new Error("Missing restaurant ID in environment variables");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const restaurantID = process.env.NEXT_PUBLIC_RESTAURANT_ID;

    const [organizedMenu, setOrganizedMenu] = useState<OrganizedMenu[]>([]);

    const {
        data: restaurant,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["restaurant", restaurantID],
        queryFn: async () => {
            const res: AxiosResponse<{
                data: Restaurant;
            }> = await axios.get(`${apiUrl}/restaurant/${restaurantID}`);
            return res.data.data;
        },
    });

    const { data: rawMenuCategory } = useQuery({
        queryKey: ["restaurant", restaurantID, "category"],
        queryFn: async () => {
            const res: AxiosResponse<{
                data: {
                    rows: MenuCategory[];
                };
            }> = await axios.get(`${apiUrl}/restaurant/${restaurantID}/category?pageSize=30000&pageNum=1&filter_enabled=true`);
            const data = res.data.data.rows;
            const sortedData = data
                // .filter((item) => item.name.toLowerCase() !== "modifiers")
                .filter((item) => item.order)
                .sort((a, b) => a.order - b.order);
            return sortedData;
        },
    });

    const { data: items } = useQuery({
        queryKey: ["menu", restaurantID],
        queryFn: async () => {
            const res: AxiosResponse<{
                data: {
                    rows: MenuItem[];
                };
            }> = await axios.get(`${apiUrl}/menu?pageSize=30000&pageNum=1&orderBy=order&orderByDir=asc&filter__idRestaurant=${restaurantID}&filter_enabled=true`);

            const data = res.data.data.rows;
            return data;
        },
    });

    useEffect(() => {
        if (items && rawMenuCategory) {
            const organized = organizeMenu(items, rawMenuCategory);
            console.log(organized);
            setOrganizedMenu(organized);
        }
    }, [items, rawMenuCategory]);

    return (
        <RestaurantContext.Provider
            value={{
                items: items ?? [],
                organizedMenu,
                isLoading,
                isFetching,
                apiUrl,
                restaurantID,
                restaurant,
            }}
        >
            {children}
        </RestaurantContext.Provider >
    );
};
