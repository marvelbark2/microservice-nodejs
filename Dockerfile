# This is the base dockerfile. Here the base image is pulled and the ras setup is done for the project.
# Make sure to include the base setup for lerna here.
FROM node:16 as base
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY ./lerna.json ./
# Package apigw
FROM base as apigw-build
WORKDIR /app/packages/apigw
# Here the dependencies will be installed and the local required packages bootstrapped.
# The --slim flag will cause the package json to only include the dependencies, so not all changes to the package json cause docker to reinstall all packages.
COPY  packages/apigw/package-slim.json package.json
WORKDIR /app/
RUN npm install -w apigw
WORKDIR /app/packages/apigw
# The normal package.json should be copied after the install into the container
COPY  packages/apigw/package.json ./
# This will only add the command to the dockerfile if the build script exists in the package otherwise its ignored.
# Package cart
FROM base as cart-build
WORKDIR /app/packages/cart
# Here the dependencies will be installed and the local required packages bootstrapped.
# The --slim flag will cause the package json to only include the dependencies, so not all changes to the package json cause docker to reinstall all packages.
COPY  packages/cart/package-slim.json package.json
WORKDIR /app/
RUN npm install -w cart
WORKDIR /app/packages/cart
# The normal package.json should be copied after the install into the container
COPY  packages/cart/package.json ./
# This will only add the command to the dockerfile if the build script exists in the package otherwise its ignored.
# Package inventory
FROM base as inventory-build
WORKDIR /app/packages/inventory
# Here the dependencies will be installed and the local required packages bootstrapped.
# The --slim flag will cause the package json to only include the dependencies, so not all changes to the package json cause docker to reinstall all packages.
COPY  packages/inventory/package-slim.json package.json
WORKDIR /app/
RUN npm install -w inventory
WORKDIR /app/packages/inventory
# The normal package.json should be copied after the install into the container
COPY  packages/inventory/package.json ./
# This will only add the command to the dockerfile if the build script exists in the package otherwise its ignored.
# Package customer
FROM base as customer-build
WORKDIR /app/packages/customer
# Here the dependencies will be installed and the local required packages bootstrapped.
# The --slim flag will cause the package json to only include the dependencies, so not all changes to the package json cause docker to reinstall all packages.
COPY  packages/customer/package-slim.json package.json
WORKDIR /app/
RUN npm install -w customer
WORKDIR /app/packages/customer
# The normal package.json should be copied after the install into the container
COPY  packages/customer/package.json ./
# This will only add the command to the dockerfile if the build script exists in the package otherwise its ignored.
# final stage
FROM base
COPY --from=apigw-build /app/packages/apigw /app/packages/apigw
COPY --from=cart-build /app/packages/cart /app/packages/cart
COPY --from=inventory-build /app/packages/inventory /app/packages/inventory
COPY --from=customer-build /app/packages/customer /app/packages/customer