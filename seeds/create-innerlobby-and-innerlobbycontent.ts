import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex('innerlobbycontent').del();
    await knex('innerlobby').del();

    const [{ id }]: Array<{ id: number }> = await knex.insert({
        title: "welcome",
        type: "publicText"
    }).into('innerlobby').returning('id');

    return await knex.insert([{
        content: "Welcomeing first of all",
        type: 'publicContent',
        innerlobby_id: id
    }, {
        content: "Welcomeing second of all",
        type: 'publicContent',
        innerlobby_id: id
    }, {
        content: "Welcomeing third of all",
        type: 'publicContent',
        innerlobby_id: id
    }
    ]).into('innerlobbycontent');
};