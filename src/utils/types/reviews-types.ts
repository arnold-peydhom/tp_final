import { ApiProperty } from "@nestjs/swagger";
import { Column, InferSelectModel, Table, TableConfig } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import { users } from "@database/database.schema";

import { Role } from "@utils/roles/roles.enum";

export type ReviewTypeReturn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Table<TableConfig<Column<any, object, object>>>,
> = Partial<Record<keyof InferSelectModel<T>, PgColumn>>;

export class ReviewsType
  implements Omit<InferSelectModel<typeof users>, "password">
{
  username: string;
  role: "admin" | "user";
  @ApiProperty()
  id: string;

  @ApiProperty()
  film_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date | null;
}
