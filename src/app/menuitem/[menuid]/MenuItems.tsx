'use client'
import { useEffect, useState, type FC } from 'react'
import { useRestaurant } from '@/context/RestaurantContext';
import { getMenuItemById } from '@/lib/get-menu-item-by-id';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Triangle } from 'lucide-react'
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GetModifiersFromItemId } from '@/lib/get-modifiers-from-item-id';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getCurrencySymbol } from '@/lib/get-currency-symbol';
import { formattedItemPrice } from '@/lib/formatted-item-price';
import type { MenuItem } from '@/types/menu';
import type { CartItemModifier } from '@/types/cart-item.type';
import toast from "react-hot-toast";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface MenuItemProps {
    id: string;
}

const MenuItems: FC<MenuItemProps> = ({ id }) => {
    console.log(id);
    const [selectedModifiers, setSelectedModifiers] = useState<MenuItem[]>([]);
    const { items } = useRestaurant();
    const item = getMenuItemById(id, items);
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(item?.price?.value);
    const [note, setNote] = useState("");
    const { addItem, cartItems } = useCart();
    const router = useRouter()

    const handleModifierChange = (modifier: MenuItem, isChecked: boolean) => {
        setSelectedModifiers((prev) => (isChecked ? [...prev, modifier] : prev.filter((m) => m._id !== modifier._id)));
    };
    useEffect(() => {
        let price = item?.price.value;
        for (const selectedModifier of selectedModifiers) {
            if (price) {
                price += selectedModifier.price.value;
            }
        }

        if (price) {
            price = parseFloat((price * quantity).toFixed(2));
        }

        setPrice(price);
    }, [item?.price.value, quantity, selectedModifiers]);

    const cart = cartItems.find((cart) => cart._idMenuItem === item?._id)
    useEffect(() => {
        if (cart?._idMenuItem === item?._id) {
            if (cart?.quantity) {
                setQuantity(cart?.quantity)
            }
            if (cart?.modifiers) {

                const modifierIds = cart.modifiers
                const modifiers = [];

                for (const modifierId of modifierIds) {
                    const modifier = items.find((item) => item._id === modifierId._idMenuItem);
                    if (modifier) {
                        modifiers.push(modifier);
                    }
                }
                modifiers.map((mod) => {
                    handleModifierChange(mod, true)
                })

            }
        }

    }, [cart])
    return (
        <section className='px-4 md:px-[100px] py-10 flex flex-col gap-6'>

            <Button className='w-fit flex justify-center items-center gap-2 bg-[#BC995D] text-black px-6 py-6 font-manrope text-lg font-[600]'
                onClick={() => router.push('/menu')}
            >
                <Image
                    src='/images/arrowleft.svg'
                    width={26}
                    height={19}
                    alt='arrowleft'
                    className='h-5 w-5'
                />
                <span className='leading-none'>Menu</span>
            </Button>

            <div className='w-full flex gap-5 justify-center items-start mb-[13vh]'>
                <div className={cn('w-full max-w-[700px] bg-[#0f0f0f] px-5 py-5 flex flex-col gap-4 items-start justify-center',
                    item?.modifiers.length !== 0 && "w-1/3",
                    !item && 'w-0 h-0 hidden'
                )}>
                    <div className='relative w-full'>
                        <div className='absolute w-full h-full left-0 top-0 flex items-end justify-center overflow-hidden z-20'>
                            <Image src='/images/image.svg' width={1175} height={119} alt='image' className="h-auto w-full object-cover" />
                        </div>
                        {item && item.images.length > 0 ? (
                            <Image src={item.images[0]!} className="h-auto w-full object-cover md:max-h-[350px]" alt={item.name} width={1980} height={1080} />
                        ) : (
                            <div className="h-[350px] w-full object-cover md:max-h-[350px] z-10 bg-black/30"></div>
                        )}
                    </div>
                    <p className='text-2xl font-manrope font-[700] text-[#FBEAD2] tracking-[1px]'>{item?.name}</p>
                    <p className='text-base font-[500] font-manrope text-[#7A7875] lowercase max-w-[70%]'>{item?.description}</p>
                    <div className='flex items-center justify-center gap-4'>
                        <p className="rounded-full bg-[#333] px-4 py-1 text-foreground tracking-[1.5px] text-xl font-[400]">
                            {item && item.takeawayPrice.value > 0 ? (
                                <>
                                    {getCurrencySymbol(item.takeawayPrice.currency)} {formattedItemPrice(item.takeawayPrice.value)}
                                </>
                            ) : (
                                <>
                                    {item && item.price.value > 0 ? (
                                        <>
                                            {getCurrencySymbol(item.price.currency)} {formattedItemPrice(item.price.value)}
                                        </>
                                    ) : (
                                        <>
                                            {item && item.modifiers.length === 0 ? (
                                                <>Free</>
                                            ) : (
                                                item && GetModifiersFromItemId(item, items, 0).map((modifier) => {
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
                        <p>{item?.isVeg && <span className="rounded-full bg-[#1a8425] px-3 py-1 font-[700] text-lg font-manrope text-white">V</span>}</p>
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <p><span className="rounded-full bg-[#2752a7] font-manrope px-3 py-1 font-[700] text-sm text-white">i</span></p>
                        <p className='text-base font-manrope tracking-[1px] underline'>Allergens & Nurtition</p>
                    </div>
                </div>
                <div className={cn('w-full md:w-2/3 flex flex-col gap-5', item?.modifiers.length === 0 && "w-0 hidden")}>
                    {item?.modifiers.map((modifier, index) => (
                        <div className='w-full bg-[#0f0f0f] p-5' key={index}>
                            <div className='flex justify-start items-center py-3 border-b-[0.1px] border-b-[#AA8B55] gap-5'>
                                <Triangle fill='#AA8B55' className='text-[#AA8B55] rotate-90' />
                                <p className='font-manrope text-[#FBEAD2] font-[700] text-xl leading-none tracking-[1px]'>{modifier.header}</p>
                            </div>
                            {item && GetModifiersFromItemId(item, items, index).length > 0 && (

                                <div>
                                    {/* <p>
                                    {JSON.stringify(GetModifiersFromItemId(item, items))}
                                </p> */}

                                    {
                                        GetModifiersFromItemId(item, items, index).map((modifier) => (

                                            <div className='flex justify-between items-center py-5 border-b-[1px] border-b-[#AA8B55] gap-5' key={modifier._id}>
                                                <div className='flex justify-center items-center gap-5'>
                                                    <Checkbox
                                                        id={modifier._id}
                                                        checked={selectedModifiers.some((m) => m._id === modifier._id)}
                                                        onCheckedChange={(checked) => handleModifierChange(modifier, checked as boolean)}
                                                        // className='rounded-full p-1 ring-[1px] h-5 w-5 ring-offset-4 ring-offset-[#0f0f0f] ring-primary border-0 border-[#0f0f0f] shadow-none bg-transparent'
                                                        className='w-6 h-6'
                                                    />
                                                    <div className='flex flex-col justify-center items-start'>
                                                        <Label htmlFor={modifier._id} className="items-center gap-2 text-lg text-[#FBEAD2] font-[700]">
                                                            {modifier.name}
                                                        </Label>
                                                        <Label htmlFor={modifier._id} className="items-center gap-2 text-base text-[#FBEAD2] font-[400] font-manrope">
                                                            {modifier.description}
                                                        </Label>
                                                    </div>
                                                </div>
                                                <p className='text-primary text-lg font-[700] font-manrope tracking-[1px]'>
                                                    {modifier.price && `${getCurrencySymbol(modifier.price.currency)} ${formattedItemPrice(modifier.price.value)}`}
                                                </p>
                                            </div>

                                        ))
                                    }
                                </div>

                            )}
                        </div>
                    ))}


                    {/* <div className='w-full bg-[#0f0f0f] p-5'>
                        <div className='flex justify-start items-center py-3 border-b-[1px] border-b-[#AA8B55] gap-5'>
                            <Triangle fill='#AA8B55' className='text-[#AA8B55] rotate-90' />
                            <p className='font-manrope text-[#FBEAD2] font-[700] text-xl leading-none tracking-[1px]'>Choose your meal</p>
                        </div>
                        <div className='flex justify-between items-center py-5 border-b-[1px] border-b-[#AA8B55] gap-5'>
                            <div className='flex justify-start items-center gap-5'>
                                <Checkbox
                                    className='h-6 w-6'
                                />
                                <Label htmlFor='' className="flex items-center text-[#FBEAD2] font-manrope text-base font-[700]">
                                    +2 Large sides
                                </Label>
                            </div>
                            <p className='text-primary text-base uppercase font-manrope font-[700] px-12'>£20.00</p>
                        </div>
                        <div className='flex justify-between items-center py-5 border-b-[1px] border-b-[#AA8B55] gap-5'>
                            <div className='flex justify-start items-center gap-5'>
                                <Checkbox
                                    className='h-6 w-6'
                                />
                                <Label htmlFor='' className="flex items-center text-[#FBEAD2] font-manrope text-base font-[700]">
                                    +4 Regular sides
                                </Label>
                            </div>
                            <p className='text-primary text-base uppercase font-manrope font-[700] px-12'>£20.00</p>
                        </div>
                    </div> */}

                </div>
            </div>

            <div className='fixed bottom-0 right-0 w-[98%] h-fit py-5 bg-[#0f0f0f] z-40 flex pr-[14%] gap-10 items-center justify-center'>
                <div className='flex justify-center items-center gap-5'>
                    <button className='bg-transparent rounded-full border-[2px] px-1 py-1 border-[#D9D9D9] text-[#D9D9D9] hover:scale-[1.2] duration-150 transition-all ease-out'
                        onClick={() => {
                            setQuantity((prev) => Math.max(prev - 1, 1));
                        }}
                    >
                        <Minus className='h-4 w-4' />
                    </button>
                    <p className='text-5xl font-[600] text-primary font-manrope'>{quantity && quantity}</p>
                    <button className='bg-transparent rounded-full border-[2px] px-1 py-1 border-[#D9D9D9] text-[#D9D9D9] hover:scale-[1.2] duration-150 transition-all ease-out'
                        onClick={() => {
                            setQuantity((prev) => prev + 1);
                        }}
                    >
                        <Plus className='h-4 w-4' />
                    </button>
                </div>
                <Button className='relative w-[400px] text-black bg-[#BC995D] font-manrope text-lg font-[700] flex justify-between items-center py-7 px-5'
                    onClick={() => {
                        const modifiers: CartItemModifier[] = [];
                        for (const selectedModifier of selectedModifiers) {
                            // const modifier = item.modifiers.find(
                            //   (m) => m._id === selectedModifier._id,
                            // );
                            // if (modifier) {
                            modifiers.push({
                                _idModifiers: item?.modifiers[0]?._id ? item?.modifiers[0]?._id : '',
                                price: selectedModifier.price,
                                _idMenuItem: selectedModifier._id
                            });
                            // }
                        }
                        addItem({
                            name: item?.name ? item?.name : '',
                            _idMenuItem: item?._id ? item?._id : '',
                            quantity,
                            price: {
                                value: price ? price : 0,
                                currency: item?.price.currency ? item?.price.currency : '',
                            },
                            notes: note,
                            modifiers: modifiers,
                            images: item?.images ? item?.images : [],
                            description: item?.description,
                        });
                        toast.success("Item added to cart");
                        setQuantity(1);
                        setNote("");
                        setSelectedModifiers([]);
                        router.push('/menu')
                    }}
                >
                    <span className='absolute left-4 -top-2'>
                        <Triangle fill='#fbead2' className='text-[#fbead2] rotate-180' />
                    </span>
                    <span className='font-bold'>ADD TO CART</span> <span>{item && getCurrencySymbol(item.price.currency)}{' '}
                        {price && formattedItemPrice(price)}</span>
                </Button>
            </div>
        </section >
    )
}

export default MenuItems