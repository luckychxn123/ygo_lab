import { Knex } from "knex";


export async function up(knex: Knex) {
    const hasTable = await knex.schema.hasTable("innerlobby");
    if (!hasTable) {
        await knex.schema.createTable("innerlobby", (table) => {
            table.increments();
            table.string("title");
            table.string("type");
        });
    }
}

export async function down(knex: Knex) {
    await knex.schema.dropTableIfExists("innerlobby");
}


