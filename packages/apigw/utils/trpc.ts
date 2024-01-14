import { AppRouter as InventoryRouter } from "@/inventory"
import { AppRouter as CartRouter } from "@/cart"

import { createTRPCClient, httpBatchLink } from '@trpc/client';


export const trpcClients = {
    cart: createTRPCClient<CartRouter>({
        links: [
            httpBatchLink({
                url: 'http://localhost:4001/trpc',
            }),
        ],
        transformer: undefined as any
    }),
    inventory: createTRPCClient<InventoryRouter>({
        links: [
            httpBatchLink({
                url: 'http://localhost:4003/trpc',
            }),
        ],

        transformer: undefined as any,
    })
}

