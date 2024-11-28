import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { date, primaryKey } from 'drizzle-orm/pg-core';
import { text, pgTable, pgEnum, timestamp, integer } from 'drizzle-orm/pg-core';

export const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
};

export const userRoleEnum = pgEnum('role', ['admin', 'user']);

export const users = pgTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  username: text().notNull().unique(),
  password: text().notNull(),
  role: userRoleEnum().notNull().default('user'),
  ...timestamps,
});

export const lecteur = pgTable('lecteur', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  born: date(),
  height: integer(),
  nationality: text(),
  photo: text(),
  ...timestamps,
});

export const lecteurRelations = relations(lecteur, ({ many }) => ({
  lecteurToLivre: many(lecteurToLivre),
}));

export const livre = pgTable('livre', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text().notNull().unique(),
  year: text().notNull(),
  director: text().notNull(),
  genre: text().notNull(),
  ...timestamps,
});

export const livreRelations = relations(livre, ({ many }) => ({
  lecteurToLivre: many(lecteurToLivre),
}));

export const lecteurToLivre = pgTable(
  'lecteurToLivre', 
  {
    lecteur_id: text().notNull().references(() => lecteur.id),
    livre: text().notNull().references(() => livre.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.lecteur_id, t.livre_id] })
  })
);

export const lecteurToLivreRelations = relations(lecteurToLivre, ({ one }) => ({
  lecteur: one(lecteur, {
    fields: [lecteurToLivre.lecteur_id],
    references: [lecteur.id],
  }),
  livre: one(livre, {
    fields: [lecteurToLivre.livre_id],
    references: [livre.id],
  }),
}));

export const reviews = pgTable('reviews', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  livre_id: text().notNull().references(() => livre.id),
  user_id: text().notNull().references(() => users.id),
  rating: integer().notNull(),
  comment: text(),
  ...timestamps,
})


export const dbSchema = {
  users,
  lecteur,
  livre,
  lecteurToLivre,
  reviews,
  lecteurRelations,
  livreRelations,
  lecteurToLivreRelations,
};