# Prigorod Taxi

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Preparation

**IMPORTANT**

Make sure the database is up to date by settings `DATABASE_URL` in .env file
(see `./.env.example` for example) and by running the migrations with below commands.

Also, make sure to set `relationMode` in `prisma/schema.prisma` to `foriegnKeys` if you're using any mysql database other than provided by PlanetScale.

```bash
$ npx prisma db push

$ npx prisma generate
```

You'll need to run `prisma db push` every time the `./prisma/schema.prisma` is updated.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# PRODUCTION MODE
$ npm run start:prod
```

## Admin Panel

To open the default Admin Panel provided by prisma, run the following:

```bash
$ npx prisma studio
```

## Documentation

### OpenAPI (Swagger)

To see the Swagger UI view for all the APIs visit `/api`, this allows you to easily test the API using a web GUI.

To get the `JSON` spec of the API visit `/api-json`

Similarly for the `YAML` spec, goto `/api-yaml`

Please note, the `JSON` and `YAML` spec files can be easily imported into REST clients like Postman and Insomnia.

## Production mode

The production mode can be enabled by setting `NODE_ENV=production` or by running below commands:

```bash
$ npm run build

$ npm start:prod
```

It is necessary to run `yarn build` before everytime running `yarn start:prod`. Since, in production mode
node.js runs the compiled `.js` files instead of `.ts` files

There are a few effects of running the app in production mode but they are mostly there for security reasons.

- It disables the `/api` endpoints for **Swagger**.
- It enables to option to "trust proxy", so that a reverse proxy like nginx can easily access the server.
