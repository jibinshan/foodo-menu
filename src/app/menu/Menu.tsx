"use client";

import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/context/RestaurantContext";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import MenuItem from "@/app/menu/MenuItem";
import { CircleMinus, CirclePlus, Trash2, Triangle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrencySymbol } from "@/lib/get-currency-symbol";
import { formattedItemPrice } from "@/lib/formatted-item-price";

export default function Menu() {
    const { organizedMenu } = useRestaurant();
    const [activeCategory, setActiveCategory] = useState<string>("");
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const isManualScroll = useRef(false);
    const lastActiveCategory = useRef<string>("");

    const updateActiveCategory = () => {
        const categories = Object.entries(categoryRefs.current);
        let activeId = "";

        // Find the first category that's in view
        for (const [id, ref] of categories) {
            if (!ref) continue;
            const rect = ref.getBoundingClientRect();
            // Check if the top of the category is above the middle of the viewport
            if (rect.top <= 300) {
                activeId = id;
            }
        }

        // If we found an active category and it's different from the last one
        if (activeId && activeId !== lastActiveCategory.current) {
            lastActiveCategory.current = activeId;
            setActiveCategory(activeId);
            // Only scroll the category button if it's not a manual scroll
            if (!isManualScroll.current) {
                categoryButtonRefs.current[activeId]?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    };

    useEffect(() => {
        // Set initial active category
        if (organizedMenu.length > 0) {
            const initialCategory = organizedMenu[0]?._id ?? "";
            setActiveCategory(initialCategory);
            lastActiveCategory.current = initialCategory;
        }

        const handleScroll = () => {
            if (!isManualScroll.current) {
                requestAnimationFrame(updateActiveCategory);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        // Initial check
        updateActiveCategory();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [organizedMenu]);

    const scrollToCategory = (categoryId: string) => {
        isManualScroll.current = true;
        lastActiveCategory.current = categoryId;
        setActiveCategory(categoryId);

        categoryRefs.current[categoryId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        categoryButtonRefs.current[categoryId]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });

        // Reset manual scroll after animation
        setTimeout(() => {
            isManualScroll.current = false;
        }, 1000);
    };

    //cart

    const router = useRouter();
    const { cartItems, updateItem, removeItem, cartValue } = useCart();
    const { restaurant, items } = useRestaurant()
    const totalAmount = parseFloat(
        cartItems
            .reduce((total, item) => {
                return total + (item.price?.value || 0);
            }, 0)
            .toFixed(2),
    );
    return (
        <section className="flex w-full max-w-[1300px] flex-row">
            <div className="flex w-full flex-col gap-4 md:w-4/6">
                {/* Categories */}
                <div className="sticky top-0 z-10 flex items-center bg-black px-4 py-2">
                    <div ref={categoryNavRef} className="scrollbar-none flex overflow-x-auto pb-2">
                        <div className="flex gap-4">
                            {organizedMenu.map((category) => (
                                <Button
                                    key={category._id}
                                    ref={(el) => {
                                        categoryButtonRefs.current[category._id] = el;
                                    }}
                                    onClick={() => scrollToCategory(category._id)}
                                    className={cn(
                                        "shrink-0 font-extrabold transition-colors",
                                        activeCategory === category._id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Items */}
                <div className="px-4">
                    <div className="flex flex-col gap-8">
                        {organizedMenu.map((category) => (
                            <div
                                key={category._id}
                                id={category._id}
                                ref={(el) => {
                                    categoryRefs.current[category._id] = el;
                                }}
                                className="scroll-mt-20"
                            >
                                <h2 className="text-2xl font-bold">{category.name}</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {category.items.map((item) => (
                                        <MenuItem key={item._id} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="hidden w-2/6 flex-col md:flex">
                <div className="sticky top-0 z-10 h-fit max-h-screen overflow-y-auto bg-[#171717] px-4 py-2">
                    <div className="scrollbar-none flex flex-col gap-4 overflow-x-auto pb-2">
                        <div className="flex w-full gap-4">
                            <Button className="w-full border border-primary bg-black font-bold uppercase text-primary hover:text-foreground">I&apos;ll Collect</Button>
                            <Button className="w-full font-bold uppercase">Delivery</Button>
                        </div>
                        <Button className="w-full bg-primary font-bold uppercase text-primary-foreground relative text-black bg-[#BC995D] font-manrope text-lg flex justify-between items-center py-6" onClick={() => router.push('/checkout')}> <span className='absolute left-4 -top-2'>
                            <Triangle fill='#fbead2' className='text-[#fbead2] rotate-180' />
                        </span>
                            <span className='font-bold'>CHECKOUT</span> <span>{"£"}{' '}
                                {formattedItemPrice(totalAmount)}</span></Button>
                        {/* Separator */}
                        <div className="h-[1px] w-full rounded-full bg-primary"></div>

                        <div className="flex min-h-[400px] w-full flex-col gap-4">
                            {cartItems.length !== 0 ? (
                                <div className="flex w-full flex-col">
                                    {cartItems.map((item, index) => (
                                        <div className="w-full flex flex-col justify-start items-start gap-3 py-5 px-3 border-b-[0.3px] border-b-primary" key={index}>
                                            <div className="w-full flex justify-between items-center">
                                                <div className="w-3/4 flex flex-col gap-1 justify-start items-start">
                                                    <p className="text-lg  text-[#FBEAD2] font-[600]">{item?.quantity}{' '}X{' '}{item.name}</p>
                                                </div>
                                                <p className="text-[#BC995D] font-[700]">{getCurrencySymbol(item.price.currency)}{' '}{formattedItemPrice(item.price.value)}</p>
                                            </div>
                                            <div className="w-full flex flex-col gap-2 justify-between items-center pl-3">
                                                {item.modifiers.map((modifiers, index) => {
                                                    const modifier = items.find((item) => item._id === modifiers._idMenuItem)?.name;
                                                    return (
                                                        <div className="w-full flex justify-between items-center" key={index}>
                                                            <p className="w-[80%] font-[400] text-sm text-[#FBEAD2]">{item?.quantity}{' '}X{' '}{modifier}</p>
                                                            <p className="text-[#BC995D] text-sm font-[700]">{getCurrencySymbol(modifiers.price.currency)}{' '}{formattedItemPrice(modifiers.price.value)}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="w-full flex justify-between items-center pt-6">
                                                <Link href={`/menuitem/${item._idMenuItem}`} className="text-[#BC995D] underline capitalize font-[400]">Edit Item</Link>
                                                <div className="flex gap-2 justify-center items-center">
                                                    <button className='hover:scale-[1.2] duration-150 transition-all ease-out'
                                                        onClick={() => {
                                                            removeItem(item._idMenuItem)
                                                        }}
                                                    >
                                                        <Trash2 />
                                                    </button>
                                                    <button className='hover:scale-[1.2] duration-150 transition-all ease-out'
                                                        onClick={() => {
                                                            if (item.quantity <= 1) {
                                                                return removeItem(item._idMenuItem);
                                                            }
                                                            updateItem(item._idMenuItem, item.quantity - 1);
                                                        }}
                                                    >
                                                        <CircleMinus />
                                                    </button>
                                                    <p className="font-[500] text-primary text-2xl">{item.quantity}</p>
                                                    <button className='hover:scale-[1.2] duration-150 transition-all ease-out'
                                                        onClick={() => {
                                                            updateItem(item._idMenuItem, item.quantity + 1);
                                                        }}
                                                    >
                                                        <CirclePlus />
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (

                                <p className="w-full text-center">Your cart is empty! Add items to proceed</p >
                            )
                            }

                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-foreground">Subtotal</p>
                            <p className="text-lg font-bold text-primary">{"£"}{' '}{formattedItemPrice(totalAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}
