import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as express from 'express';


const prisma = new PrismaClient();

const t = initTRPC.create();
const appRouter = t.router({
    getProducts: t.procedure
        .input(
            z.object({
                skip: z.number().nullish(),
                take: z.number().nullish()
            }).nullish()
        )
        .query(async (opts) => {
            const input = opts.input;
            const products = await prisma.product.findMany({
                skip: input?.skip,
                take: input?.take
            });

            return products;
        }),
    getProduct: t.procedure
        .input(z.string())
        .query(async (opts) => {
            const productId = opts.input;
            const maybeProduct = await prisma.product.findUnique({
                where: { id: productId },
            });
            if (!maybeProduct) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Product not found',
                })
            } else {
                return maybeProduct;
            }
        }),
    createProduct: t.procedure
        .input(z.object({
            name: z.string().min(5),
            description: z.string().nullish(),
            price: z.number().positive(),
            quantity: z.number().positive(),
        }))
        .mutation(async (opts) => {
            // use your ORM of choice
            const data = opts.input;
            const product = await prisma.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    quantity: data.quantity
                },
            });

            return product;
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
        console.log(`🚀 Product service ready at: http://localhost:${PORT}`);
    });
}