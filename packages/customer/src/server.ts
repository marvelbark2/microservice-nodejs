import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as express from 'express';


const prisma = new PrismaClient();

const t = initTRPC.create();
const appRouter = t.router({
    getCustomer: t.procedure
        .input(z.string())
        .query(async (opts) => {
            const customerId = opts.input;
            console.log(opts);
            const maybeCustomer = await prisma.customer.findUnique({
                where: { id: customerId },
            });
            if (!maybeCustomer) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Customer not found',
                })
            } else {
                return maybeCustomer;
            }
        }),
    createCustomer: t.procedure
        .input(z.object({
            name: z.string().min(5),
            email: z.string().email()
        }))
        .mutation(async (opts) => {
            // use your ORM of choice
            const { name, email } = opts.input;
            const user = await prisma.customer.create({
                data: {
                    name,
                    email: email
                },
            });

            return user;
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
        console.log(`🚀 Customer service ready at: http://localhost:${PORT}`);
    });
}