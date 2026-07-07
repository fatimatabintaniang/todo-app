import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { pool } from "../db.js";

const todosRoute = new OpenAPIHono();

// ---- Schemas ----
const TodoSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  title: z.string().openapi({ example: "Acheter du pain" }),
  done: z.boolean().openapi({ example: false }),
  created_at: z.string().openapi({ example: "2026-07-03T10:00:00.000Z" }),
}).openapi("Todo");

const CreateTodoSchema = z.object({
  title: z.string().min(1).openapi({ example: "Acheter du pain" }),
}).openapi("CreateTodo");

const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: "Acheter du pain complet" }),
  done: z.boolean().optional().openapi({ example: true }),
}).openapi("UpdateTodo");

const IdParamSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" }, example: "1" }),
});

const ErrorSchema = z.object({
  message: z.string().openapi({ example: "Todo introuvable" }),
}).openapi("Error");

// ---- GET /todos ----
todosRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Todos"],
    summary: "Lister toutes les tâches",
    responses: {
      200: {
        description: "Liste des tâches",
        content: { "application/json": { schema: z.array(TodoSchema) } },
      },
    },
  }),
  async (c) => {
    const { rows } = await pool.query(
      "SELECT * FROM todos ORDER BY id ASC"
    );
    return c.json(rows);
  }
);

// ---- POST /todos ----
todosRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Todos"],
    summary: "Créer une tâche",
    request: {
      body: {
        content: { "application/json": { schema: CreateTodoSchema } },
      },
    },
    responses: {
      201: {
        description: "Tâche créée",
        content: { "application/json": { schema: TodoSchema } },
      },
    },
  }),
  async (c) => {
    const { title } = c.req.valid("json");
    const { rows } = await pool.query(
      "INSERT INTO todos (title) VALUES ($1) RETURNING *",
      [title]
    );
    return c.json(rows[0], 201);
  }
);

// ---- PATCH /todos/:id ----
todosRoute.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Todos"],
    summary: "Mettre à jour une tâche (titre et/ou statut)",
    request: {
      params: IdParamSchema,
      body: {
        content: { "application/json": { schema: UpdateTodoSchema } },
      },
    },
    responses: {
      200: {
        description: "Tâche mise à jour",
        content: { "application/json": { schema: TodoSchema } },
      },
      404: {
        description: "Tâche introuvable",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { title, done } = c.req.valid("json");

    const { rows } = await pool.query(
      `UPDATE todos
       SET title = COALESCE($1, title),
           done = COALESCE($2, done)
       WHERE id = $3
       RETURNING *`,
      [title ?? null, done ?? null, id]
    );

    if (rows.length === 0) {
      return c.json({ message: "Tâche introuvable" }, 404);
    }
    return c.json(rows[0]);
  }
);

// ---- DELETE /todos/:id ----
todosRoute.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Todos"],
    summary: "Supprimer une tâche",
    request: { params: IdParamSchema },
    responses: {
      204: { description: "Tâche supprimée" },
      404: {
        description: "Tâche introuvable",
        content: { "application/json": { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { rowCount } = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
    if (rowCount === 0) {
      return c.json({ message: "Tâche introuvable" }, 404);
    }
    return c.body(null, 204);
  }
);

export default todosRoute;
