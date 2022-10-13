import express from 'express'
import { Knex } from "knex";
import innerLobbyService from './lobbyknex/lobbyinner-service';
import innerLobbyController from './lobbyknex/lobbyinner-controller';

export const innerLobbyRoutes = express.Router()

export function innerLobbyInitialize(knex: Knex) {
    const service = new innerLobbyService(knex);
    const controller = new innerLobbyController(service);

    innerLobbyRoutes.get('/innerLobbySpeech', controller.getWelcomeSpeech)

}