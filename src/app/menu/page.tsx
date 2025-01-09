import Menu from "@/app/menu/Menu";

export default function MenuPage() {
    return (
        <section>
            <div className="flex items-center justify-center gap-4 p-4">
                <h1 className="text-2xl font-bold">Menu</h1>
            </div>
            <div className="flex justify-center">
                <Menu />
            </div>
        </section>
    );
}
