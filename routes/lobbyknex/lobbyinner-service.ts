import { Client } from 'pg';
import { Knex } from "knex";

export default class innerLobby {
    constructor(private knex: Knex) { }
    // select * from innerlobbycontent inner join innerlobby on innerlobbycontent.innerlobby_id = innerlobby.id where innerlobby.id = 1;



    async getInnerLobbyContent(id: number) {
        const results: 'any' = (await this.knex.raw(`select * from innerlobbycontent inner join innerlobby on innerlobbycontent.innerlobby_id = innerlobby.id where innerlobby.id = (?);`, [id])).rows;
        return results;
    }
}