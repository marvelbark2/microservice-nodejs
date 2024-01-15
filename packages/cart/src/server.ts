import { TRPCError, initTRPC } from '@trpc/server';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as express from 'express';

import { Cart } from './cart';


const t = initTRPC.create();


const protectedProcedure = t.procedure
const appRouter = t.router({
    getCart: protectedProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            const customerId = input;
            const cart = new Cart(customerId);
            return cart.items;
        }),
    addToCart: protectedProcedure
        .input(z.object({
            product_id: z.string().min(5),
            quantity: z.number(),
            customer_id: z.string()
        }))
        .mutation(({ ctx, input }) => {
            if (typeof input.product_id !== "string" || (!input.quantity && input.quantity !== 0)) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            } else {
                const customerId = input.customer_id;
                const cart = new Cart(customerId);

                cart.addItem({
                    product_id: input.product_id,
                    quantity: input.quantity
                });
                return cart.items;
            }
        })
});

export type AppRouter = typeof appRouter;

export function run(PORT: number) {
    const app = express();

    app.use(
        '/trpc',
        trpcExpress.createExpressMiddleware({
            router: appRouter
        }),
    );
    app.listen(PORT, () => {
        console.log(`🚀 Cart service ready at: http://localhost:${PORT}`);
    });
}