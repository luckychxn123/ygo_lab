
import express, { Request, Response } from 'express'
// import { Socket } from 'socket.io';

import { client } from "../utils/db";
import { Client } from 'pg'; //this is a type from library so must import from library, not from other file wrote ourselves
import { Knex } from "knex";




import { SocketAddressInitOptions } from 'net';
import SocketIO from 'socket.io';
import { io } from '../utils/socket';
import { currenthostandjoineduser, availableusers, lobbyrooms, lobbyliverooms, setAvailableusers, setLobbyrooms, setLobbyliverooms } from './lobby-routescontroller';


export let lobbyRoutes = express.Router()



declare module 'express-session' {
    interface SessionData {
        username?: string;
        password?: string;
        available?: boolean;
        user?: any
    }
}


// export let availableusers: any[] = [];
// export let lobbyrooms: any[] = [];
// export let lobbyliverooms: any[] = [];
// let currenthostandjoineduser: any = "";
// export function setAvailableusers(newAvailableusers: any[]) {
//     availableusers = JSON.parse(JSON.stringify(newAvailableusers))
// }
// export function setLobbyrooms(newLobbyrooms: any[]) {
//     lobbyrooms = JSON.parse(JSON.stringify(newLobbyrooms))
// }
// export function setLobbyliverooms(newLobbyliverooms: any[]) {
//     lobbyliverooms = JSON.parse(JSON.stringify(newLobbyliverooms))
// }





export class lobbyRoutesService {
    constructor(private client: Client) { };
    // all func
    async joinedCommercial(req: express.Request, res: express.Response) {
        return { 'username': req.session['user']['username'], 'userid': req.session['user']['id'] }
    }
    async earnedFromCommercial(req: express.Request, res: express.Response) {
        await useraddmoney(req.body.userid, req.body.amount);
    }
    async joinedRoomSync(req: express.Request, res: express.Response) {
        let opponent = currenthostandjoineduser['host'];
        let opponentid = currenthostandjoineduser['hostid'];
        let cards = { 'mycards': [], 'opponentcards': [], 'allmycards': [] };
        let mydeckwithitems = {}
        let decknames: any = { 'mydecks': [], 'opponentdecks': [] }
        let opponentdeckwithitems = {}
        if (currenthostandjoineduser['host'] == req.session['user']['username']) {
            opponent = currenthostandjoineduser['joinedperson']
            opponentid = currenthostandjoineduser['joinedpersonid']
        }
        //fetch all of my cards with duplication
        await fetchallcards(req.session['user']['id'], cards['allmycards'])
        //fetch all of my cards and opponent cards
        await fetchcards(req.session['user']['id'], cards['mycards'])
        await fetchcards(opponentid, cards['opponentcards'])
        // fetch all of my deck with items accordingly
        await fetchdeckcards(req.session['user']['id'], decknames['mydecks'], mydeckwithitems);
        await fetchdeckcards(opponentid, decknames['opponentdecks'], opponentdeckwithitems);
        return {
            'currentuser': req.session['user']['username'], 'currentuserid': req.session['user']['id'],
            opponent, opponentid, cards, decknames, mydeckwithitems, opponentdeckwithitems
        }
    }
}
export async function fetchdeckcards(userid: number, deckarray: Array<['string']>,
    dict: Object) {
    // let alld = await knex.select('*').from('user_decks').where('user_id', `${userid}`);
    // console.log('alld - ', alld)
    let alld = await client.query(`select * from user_decks where user_id = ${userid};`)
    let all = await client.query(`select * from user_decks 
    inner join user_deck_cards on user_deck_cards.user_deck_id = user_decks.id
    inner join user_cards on user_cards.id = user_deck_cards.user_card_id
    inner join cards on cards.id = user_cards.card_id
    where user_cards.user_id = ${userid};`)
    let deckimgrows = all.rows;
    let deckrows = alld.rows;
    // let deckrows = alld;
    for (let d of deckrows) {
        deckarray.push(d['deck_name'])
    }
    for (let deck of deckarray) {
        let d: any = deck;
        dict[d] = []
    }
    for (let deck of deckarray) {
        for (let card of deckimgrows) {
            if (card['quantity'] > 0) {
                if (deck == card['deck_name']) {
                    let d: any = deck;
                    dict[d].push(card['image'])
                }
            }
        }
    }
}






async function useraddmoney(userid: number, amount: number) {
    let u = await client.query(`select * from users where id = ${userid};`)
    let user = u.rows;
    let originalAmount;
    for (let u of user) {
        originalAmount = u['cash']
    }
    originalAmount += amount;
    await client.query(`update users set cash = ${originalAmount} where id = ${userid}`)
}


//func to fetch all cards of user
export async function fetchcards(userid: number, array: Array<['string']>) {
    let a = await client.query(`select * from cards inner join user_cards 
    on user_cards.card_id = cards.id where user_cards.user_id = ${userid};`);
    let allopponentcards = a.rows;
    for (let card of allopponentcards) {
        if (card['quantity'] > 0) {
            array.push(card['image']);
        }

    }
}

//     //[problem] array here is updated without duplicated items, but when called as func later,
//     // passed array is not updated with duplicated item => 
//     // [solution]: cannot assign [] directly, must make [] the same type as passed in func
//     return array;

// fetch TOTAL of user cards with duplication
export async function fetchallcards(userid: number, array: Array<['string']>) {
    let all = await client.query(`select * from user_cards inner join cards on user_cards.card_id = cards.id where user_id = ${userid};`)
    let allcardrows = all.rows;
    for (let a of allcardrows) {
        for (let i = 0; i < a['quantity']; i++) {
            array.push(a['image'])
        }
    }
}


//invite user
// lobbyRoutes.post('/inviteuser', (req, res) => {
//     const aindex = availableusers.findIndex(function (availableusers) {
//         return req.session['user']['username'] == availableusers['username']
//     })
//     if (availableusers[aindex]['createdroom']) {
//         let currentuser = req.body.currentuser;
//         let inviteduser = req.body.inviteduser;
//         io.to(inviteduser).emit('alertUser', `${currentuser} wants to invite you to join room!`)
//     }
//     res.send()
//     return
// })