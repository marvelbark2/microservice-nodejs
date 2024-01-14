import { trpcClients } from "apigw/utils/trpc";
//@ts-ignore
import { gql } from "ryo.js/public"

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } = gql;

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLString },
        quantity: { type: GraphQLString },
        createdAt: { type: GraphQLString },
    },
});

const CartType = new GraphQLObjectType({
    name: 'Cart',
    fields: {
        id: { type: GraphQLID },
        product_id: { type: GraphQLString },
        quantity: { type: GraphQLString }
    },
})


const CartTypeConfig = CartType.toConfig();

const ExtendedCartType = new GraphQLObjectType({
    ...CartTypeConfig,
    fields: {
        ...CartTypeConfig.fields,
        product: {
            type: ProductType,
            resolve: async (cart) => {
                const product = await trpcClients.inventory.getProduct.query(cart.product_id);
                return product;
            }
        }

    }
})

// Define the root query type
const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getCart: {
            type: new GraphQLList(ExtendedCartType),
            args: {
                customerId: { type: GraphQLString }
            },
            resolve: async ({ customerId }) => {
                const cart = await trpcClients.cart.getCart.query(customerId);
                return cart;
            }
        },
        getProducts: {
            type: new GraphQLList(ProductType),
            args: {
                skip: { type: GraphQLString },
                take: { type: GraphQLString },
            },
            resolve: async (_, { skip, take }) => {
                if (skip) skip = parseInt(skip)
                if (take) take = parseInt(take)
                const products = await trpcClients.inventory.getProducts.query({ skip, take });
                console.log(products);
                return products;
            }
        }
    },
});


// Create the GraphQL schema
const schema = new GraphQLSchema({
    query: QueryType,
});


export default { schema };