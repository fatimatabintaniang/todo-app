import "dotenv/config";
import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import todosRoute from "./routes/todos.js";
import { initDb } from "./db.js";

const app = new OpenAPIHono();

app.use("*", cors());

// Routes
app.route("/todos", todosRoute);

// OpenAPI JSON spec
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Todo API",
    version: "1.0.0",
    description: "API REST pour gérer une liste de tâches (Hono + PostgreSQL)",
  },
});

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/", (c) => c.text("Todo API — doc Swagger sur /ui"));

const port = process.env.PORT || 3001;

initDb()
  .then(() => {
    console.log("Base de données prête");
    serve({ fetch: app.fetch, port: Number(port) });
    console.log(`Serveur démarré sur http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/ui`);
  })
  .catch((err) => {
    console.error("Erreur d'initialisation de la base de données:", err);
    process.exit(1);
  });
