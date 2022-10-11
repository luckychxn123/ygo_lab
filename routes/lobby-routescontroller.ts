
import express, { Request, Response } from 'express'
// import { Socket } from 'socket.io';
import { lobbyRoutesService } from './lobby-routesservice'
import SocketIO from 'socket.io';


export let lobbyRoutes = express.Router()



declare module 'express-session' {
    interface SessionData {
        username?: string;
        password?: string;
        available?: boolean;
        user?: any
    }
}


export let availableusers: any[] = [];
export let lobbyrooms: any[] = [];
export let lobbyliverooms: any[] = [];
export function setAvailableusers(newAvailableusers: any[]) {
    availableusers = JSON.parse(JSON.stringify(newAvailableusers))
}
export function setLobbyrooms(newLobbyrooms: any[]) {
    lobbyrooms = JSON.parse(JSON.stringify(newLobbyrooms))
}
export function setLobbyliverooms(newLobbyliverooms: any[]) {
    lobbyliverooms = JSON.parse(JSON.stringify(newLobbyliverooms))
}
export let currenthostandjoineduser: any = "";


export class lobbyRoutesController {
    constructor(private lobbyRoutesService: lobbyRoutesService,
        private io: SocketIO.Server) { }; //[problem here][ask here] io is undefined
    createRoomC = async (req: express.Request, res: express.Response) => {
        //: Promise<any>
        let usn = req.body.username;
        let usnid = req.body.currentuserid;
        console.log('line 44 == ', availableusers)
        const index = availableusers.findIndex(function (availableusers) {
            return usn === availableusers['username']
        })
        console.log('line 49 == ', availableusers, index)
        if (availableusers[index]['createdroom'] == false) {
            availableusers[index]['createdroom'] = true;
            lobbyrooms.push({ 'host': usn, 'hostid': usnid, 'joinedperson': null, 'joinedpersonid': null })
            this.io.emit('updatelobbyroom', lobbyrooms)
        } else {
            this.io.to(availableusers[index]['username']).emit('alertUser', "You've created a room already!") //send alert to user if room has been created
        }
        res.send()
        return
    }


    // all func
    deleteRoomC = async (req: express.Request, res: express.Response) => {
        let usn = req.body.username; //the box's host
        let usnid = req.body.userid;//the box's host id
        let currentuser = req.session.user.username; //currentuser
        let currentuserid = req.session.user.id; //currentuser id
        // aindex = find currentuser from availableusers
        const aindex = availableusers.findIndex(function (availableusers) {
            return currentuser == availableusers['username']
        })
        //if host press quit room
        if (availableusers[aindex]['username'] == usn) {
            console.log('quit room')
            const index = lobbyrooms.findIndex(function (lobbyrooms) {
                return currentuser == lobbyrooms['host']
            })
            lobbyrooms = lobbyrooms.filter(function (x) {
                return x != lobbyrooms[index]
            })
            availableusers[aindex]['createdroom'] = false;

        } //if host press join room
        else if (availableusers[aindex]['username'] != usn) {
            //if host created room already
            if (availableusers[aindex]['createdroom']) {
                console.log('-io line 126 plz quit room first - ', this.io)
                this.io.to(availableusers[aindex]['username']).emit('alertUser', 'Please quit your created room first!')
            } //if host didnt create room
            else {
                // index = find host from lobbyroom
                const index = lobbyrooms.findIndex(function (lobbyrooms) {
                    return usn == lobbyrooms['host']
                })
                if (lobbyrooms[index]['joinedperson'] === null) {
                    //if room is available for joining
                    let joinPerson = availableusers[aindex]['username']
                    let joinPersonId = availableusers[aindex]['userid']
                    let hostPerson = lobbyrooms[index]['host']
                    let hostPersonId = lobbyrooms[index]['hostid'] //[lucky here]
                    let currenthostandjoinedperson = { 'host': hostPerson, 'hostid': hostPersonId, 'joinedperson': joinPerson, 'joinedpersonid': joinPersonId }
                    currenthostandjoineduser = currenthostandjoinedperson
                    //tell lobbyrooms <[array]> joined person is occupied
                    lobbyrooms[index]['joinedperson'] = joinPerson
                    // hostingrooms.push(currenthostandjoinedperson)
                    //find host from avilableusers so he can create room later
                    const hindex = availableusers.findIndex(function (availableusers) {
                        return availableusers['username'] == usn
                    })
                    availableusers[hindex]['createdroom'] = false;
                    // remove room from lobby rooms
                    lobbyrooms = lobbyrooms.filter(function (x) {
                        return x != lobbyrooms[index]
                    })
                    // for redirecting host and joined person
                    this.io.to(hostPerson).emit('redirect', '/lobbyroom/lobbytoprivateroom.html')
                    this.io.to(joinPerson).emit('redirect', '/lobbyroom/lobbytoprivateroom.html')
                    //for new redirected page to receive events [here] - this dont work as it loads too fast
                }
                else {
                    //if others joined room => room not available for joining, inform joined user
                    this.io.to(availableusers[aindex]['username']).emit('alertUser', `${lobbyrooms[index]['host']}'s room is full, please join another one!`)
                }
            }
        }
        console.log('-io line 163 - ', this.io)
        this.io.emit('updatelobbyroomfordelete', lobbyrooms)
        res.send()
        return
    }
    getMySession = async (req: express.Request, res: express.Response) => {
        res.json((req.session))
        return
    }
    jumpToCommercial = async (req: express.Request, res: express.Response) => {
        this.io.to(req.body.currentuser).emit('redirect', '/lobbyroom/commercial.html')

    }
    joinedCommercialC = async (req: express.Request, res: express.Response) => {
        // console.log('this.lobbyRoutesService.joinedCommercial(req, res)', await this.lobbyRoutesService.joinedCommercial(req, res)['username'])
        // [test] above line cannot be print indiv term but it's a promise => so must await or have error
        // [very imp] [focus] all this.lobbyRoutesService needs await, even json
        res.json(await this.lobbyRoutesService.joinedCommercial(req, res))
        return
    }
    earnedFromCommercialC = async (req: express.Request, res: express.Response) => {
        await this.lobbyRoutesService.earnedFromCommercial(req, res);
        this.io.to(req.session.user.username).emit('redirect', '/lobbyroom/lobby.html')
        console.log('earned from com controller side')
        res.send();
        return
    }
    joinedRoomSyncC = async (req: express.Request, res: express.Response) => {
        let item = await this.lobbyRoutesService.joinedRoomSync(req, res);
        res.status(200).json(item)
        return
    }
    userConfirmedcard = async (req: express.Request, res: express.Response) => {
        let opponentusername = req.body.opponentusername;
        let opponentid = req.body.opponentid;
        let confirmedcard = req.body.card;
        //if currentuser is currentuser itself
        this.io.to(opponentusername).emit('userconfirmedcard', confirmedcard)
        res.send()
        return
    }
}


// array is deckname's img