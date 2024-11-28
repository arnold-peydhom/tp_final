import { ApiProperty } from "@nestjs/swagger";
import { Column, InferSelectModel, Table, TableConfig } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import { users } from "@database/database.schema";

import { Role } from "@utils/roles/roles.enum";

export type UserWithoutPasswordReturn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Table<TableConfig<Column<any, object, object>>>,
> = Partial<Record<keyof InferSelectModel<T>, PgColumn>>;

export class UserWithoutPassword
  implements Omit<InferSelectModel<typeof users>, "password">
{
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date | null;
}
