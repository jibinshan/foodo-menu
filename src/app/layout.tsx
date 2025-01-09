import "@/styles/globals.css";

import Providers from "@/app/providers";
import { cn } from "@/lib/utils";
import { type Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
});

export const metadata: Metadata = {
    title: "Foodo Menu",
    description: "Foodo Menu",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn("min-h-screen bg-background font-manrope antialiased", manrope.variable)}>
                <Providers>
                    <nav className="flex items-center justify-center gap-4 p-4">Navbar</nav>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
