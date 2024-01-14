import { createClient } from 'redis';

export interface CartItem {
    product_id: string;
    quantity: number;
}

export const redisClientKey = "REDIS_CLIENT"
export const redisClients = new Map<string, any>();


async function getOrcreateClient() {
    if (redisClients.has(redisClientKey)) {
        return redisClients.get(redisClientKey);
    } else {
        const client = await createClient({
            url: process.env.REDIS_URL
        })
            .on('error', err => console.log('Redis Client Error', err))
            .connect();
        redisClients.set(redisClientKey, client);
        return client;
    }
}

async function getOrCreateCart(customerId: string) {
    const client = await getOrcreateClient();

    const cart = await client.get(customerId);

    if (cart) {
        return JSON.parse(cart);
    } else {
        const newCart = [];
        await client.set(customerId, JSON.stringify(newCart));
        return newCart;
    }

}

export class Cart {
    private _items: CartItem[] = [];

    constructor(private customerId: string) {
        this.init();
    }


    private async init() {
        const value = await getOrCreateCart(this.customerId);
        this._items = value;
    }

    async save() {
        const client = await getOrcreateClient();
        await client.set(this.customerId, JSON.stringify(this._items));
    }
    addItem(item: CartItem) {
        const items = this._items;
        const existingItem = items.find(i => i.product_id === item.product_id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            items.push(item);
        }
        this.save().catch(err => console.log('Error saving cart', err));
    }

    removeItem(productId: string) {
        const items = this._items;
        const index = items.findIndex(i => i.product_id === productId);
        if (index > -1) {
            const qte = items[index].quantity;
            if (qte > 1) {
                items[index].quantity--;
            } else {
                items.splice(index, 1);
            }
        }
        this.save().catch(err => console.log('Error saving cart', err));
    }


    get items() {
        return this._items;
    }
}