import { Knex } from "knex";


export async function up(knex: Knex) {
    const hasTable = await knex.schema.hasTable("innerlobbycontent");
    if (!hasTable) {
        await knex.schema.createTable("innerlobbycontent", (table) => {
            table.increments();
            table.string("content");
            table.string("type");
            table.integer("innerlobby_id").unsigned();
            table.foreign("innerlobby_id").references("innerlobby.id");
        });
    }
}

export async function down(knex: Knex) {
    await knex.schema.dropTableIfExists("innerlobbycontent");
}