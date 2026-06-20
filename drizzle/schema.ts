import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull(),
  anonId: text("anon_id"),
  disabled: boolean("disabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clicks = pgTable("clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const linksRelations = relations(links, ({ many }) => ({
  clicks: many(clicks),
  reports: many(reports),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, { fields: [clicks.linkId], references: [links.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  link: one(links, { fields: [reports.linkId], references: [links.id] }),
}));
