import MenuItems from "./MenuItems";

interface pageProps {
    params: {
        menuid: string
    }
}

const page = async ({ params }: pageProps) => {
    const { menuid } = await params;
    if (menuid) {
        return <div>
            <MenuItems id={menuid} />
        </div>
    }
    return <div>Menu ID not provided</div>;
}

export default page