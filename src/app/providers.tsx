"use client";

import { CartProvider } from "@/context/CartContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <RestaurantProvider>
                    <CartProvider>
                        {children}
                        <Toaster />
                    </CartProvider>
                </RestaurantProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
