import type { SupabaseClient } from "@supabase/supabase-js";

export class InventoryItem {
    static items: InventoryItem[] = []

    id!: number;
    name!: string;
    description!: string;
    min_stock!: number;
    should_restock!: boolean;

    public static async fetch_all(supabase: SupabaseClient) {
        InventoryItem.items = [];
        const items = await (await supabase.from("inventory").select("*")).data;
        if (!items) {
            return InventoryItem.items;
        }
        for (const item of items) {
            let inventory_item = new InventoryItem();
            inventory_item.id = item.id;
            inventory_item.name = item.name;
            inventory_item.description = item.description;
            inventory_item.min_stock = item.min_stock;
            inventory_item.should_restock = item.should_restock;
            InventoryItem.items.push(inventory_item);
        }
        return InventoryItem.items;
    }

    public async sync(supabase: SupabaseClient) {
        return await supabase.from("inventory").update({
            id: this.id,
            name: this.name,
            description: this.description,
            min_stock: this.min_stock,
            should_restock: this.should_restock
        }).match({ id: this.id });
    }
}