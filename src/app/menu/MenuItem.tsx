"use client";

import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/context/RestaurantContext";
import { formattedItemPrice } from "@/lib/formatted-item-price";
import { getCurrencySymbol } from "@/lib/get-currency-symbol";
import { GetModifiersFromItemId } from "@/lib/get-modifiers-from-item-id";
import type { MenuItem } from "@/types/menu";
import Image from "next/image";
import Link from "next/link";

export default function MenuItem({ item }: { item: MenuItem }) {
    const { items } = useRestaurant()
    return (
        <div className="flex w-full flex-col items-center justify-between gap-4 bg-[#0F0F0F] p-4">
            <div className="flex w-full flex-row justify-between gap-4">
                <div>
                    <p className="text-lg font-bold text-foreground">
                        {item.name} {item.isVeg && <span className="rounded-full bg-[#46f781] px-2 py-1 text-sm text-white">V</span>}
                    </p>
                    <p className="line-clamp-2 text-sm text-[#7A7875]">{item.description}</p>
                </div>
                <div>
                    {item.images.length > 0 ? (
                        <Image src={item.images[0]!} className="max-h-28 min-h-28 min-w-28 max-w-28 object-cover" alt={item.name} width={1980} height={1080} />
                    ) : (
                        <div className="h-28 w-28 rounded-md"></div>
                    )}
                </div>
            </div>
            <div className="flex w-full flex-row items-center justify-between gap-4">
                <p className="rounded-3xl bg-[#333] p-2 px-2 py-1 text-foreground tracking-[1px]">
                    {/* {item.price.currency === "GBP" ? "£" : item.price.currency === "EUR" ? "€" : item.price.currency === "USD" ? "$" : item.price.currency} */}
                    {/* {formattedItemPrice(item.price.value)} */}

                    {item.takeawayPrice.value > 0 ? (
                        <>
                            {getCurrencySymbol(item.takeawayPrice.currency)} {formattedItemPrice(item.takeawayPrice.value)}
                        </>
                    ) : (
                        <>
                            {item.price.value > 0 ? (
                                <>
                                    {getCurrencySymbol(item.price.currency)} {formattedItemPrice(item.price.value)}
                                </>
                            ) : (
                                <>
                                    {item.modifiers.length === 0 ? (
                                        <>Free</>
                                    ) : (
                                        GetModifiersFromItemId(item, items, 0).map((modifier) => {
                                            if (modifier._id === item.modifiers.find((modifier) => modifier.defaultSelection)?.defaultSelection) {
                                                return `${getCurrencySymbol(modifier.price.currency)} ${modifier.price.value}`;
                                            }
                                        })
                                    )}
                                </>
                            )}
                        </>
                    )}
                </p>
                <Link href={`/menuitem/${item._id}`}>
                    <Button variant="secondary" className="bg-[#161616] px-8 text-lg font-bold text-primary">
                        Add
                    </Button>
                </Link>
            </div>
        </div >
    );
}
