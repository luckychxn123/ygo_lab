import express, { Request, Response } from 'express'
// import { Socket } from 'socket.io';
import { lobbyRoutesService } from './lobby-routesservice'
import { lobbyRoutesController } from './lobby-routescontroller';
import { client } from "../utils/db";
import { Client } from 'pg'; //this is a type from library so must import from library, not from other file wrote ourselves
import { Server as SocketIO } from 'socket.io'
import { io } from '../utils/socket';

export let lobbyRoutes = express.Router()

// knex



export function initialize(client: Client, io: SocketIO) {
    const oldlrs = new lobbyRoutesService(client);
    const lrc = new lobbyRoutesController(oldlrs, io);
    // express func
    lobbyRoutes.get('/my-session', lrc.getMySession)

    // create room
    lobbyRoutes.post('/createroom', lrc.createRoomC)

    //host quit his own created room or join other rooms
    lobbyRoutes.post('/deleteroom', lrc.deleteRoomC)

    //commercial part
    lobbyRoutes.post('/jumptocommercial', lrc.jumpToCommercial)

    //to fetch data from commercial
    lobbyRoutes.post('/joinedcommercial', lrc.joinedCommercialC)

    //add money for user whome watched commercial enough time
    lobbyRoutes.post('/earnedfromcommercial', lrc.earnedFromCommercialC)

    //sending currentuser and joined user
    lobbyRoutes.post('/joinedroomsync', lrc.joinedRoomSyncC)

    //for trade part
    lobbyRoutes.post('/userconfirmedcard', lrc.userConfirmedcard)
}
