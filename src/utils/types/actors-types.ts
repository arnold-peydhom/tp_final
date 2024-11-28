import { ApiProperty } from '@nestjs/swagger';
import { Column, InferSelectModel, Table, TableConfig } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';

import { actors } from '@database/database.schema';

export type ActorReturn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Table<TableConfig<Column<any, object, object>>>,
> = Partial<Record<keyof InferSelectModel<T>, PgColumn>>;

export class Actor implements InferSelectModel<typeof actors> {
    @ApiProperty()
    id: string;
    
    @ApiProperty()
    name: string;

    @ApiProperty()
    born: string | null;

    @ApiProperty()
    height: number | null;

    @ApiProperty()
    nationality: string | null;

    @ApiProperty()
    photo: string | null;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date | null;
}
