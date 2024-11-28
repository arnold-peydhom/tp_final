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

export const actors = pgTable('actors', {
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

export const actorsRelations = relations(actors, ({ many }) => ({
  actorsToFilms: many(actorsToFilms),
}));

export const films = pgTable('films', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text().notNull().unique(),
  year: text().notNull(),
  director: text().notNull(),
  genre: text().notNull(),
  ...timestamps,
});

export const filmsRelations = relations(films, ({ many }) => ({
  actorsToFilms: many(actorsToFilms),
}));

export const actorsToFilms = pgTable(
  'actors_to_films', 
  {
    actor_id: text().notNull().references(() => actors.id),
    film_id: text().notNull().references(() => films.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.actor_id, t.film_id] })
  })
);

export const actorsToFilmsRelations = relations(actorsToFilms, ({ one }) => ({
  actor: one(actors, {
    fields: [actorsToFilms.actor_id],
    references: [actors.id],
  }),
  film: one(films, {
    fields: [actorsToFilms.film_id],
    references: [films.id],
  }),
}));

export const reviews = pgTable('reviews', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  film_id: text().notNull().references(() => films.id),
  user_id: text().notNull().references(() => users.id),
  rating: integer().notNull(),
  comment: text(),
  ...timestamps,
})


export const dbSchema = {
  users,
  actors,
  films,
  actorsToFilms,
  reviews,
  actorsRelations,
  filmsRelations,
  actorsToFilmsRelations,
};