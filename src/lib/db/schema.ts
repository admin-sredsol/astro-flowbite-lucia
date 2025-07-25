import { pgTable, text, timestamp, jsonb, uuid, json} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  logtoId: text("logto_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const calculatorStateTable = pgTable("calculator_state", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => userTable.id),
  courseId: text("course_id").notNull(),
  name: text("name").notNull(), // From savedStatesTable
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

export const quizProgressTable = pgTable("quiz_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: text("course_id").notNull(),
  userId: text("user_id").notNull().references(() => userTable.id),
  quizName: text("quiz_name").notNull(),
  score: text("score").notNull(),
  progress: json("progress").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});