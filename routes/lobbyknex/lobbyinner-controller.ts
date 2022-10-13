
import { Request, Response } from "express"
import innerLobbyService from './lobbyinner-service'

export default class innerLobbyController {
    private service: innerLobbyService;
    constructor(service: innerLobbyService) {
        this.service = service;
    }
    getWelcomeSpeech = async (req: Request, res: Response) => {
        let content: any = await this.service.getInnerLobbyContent(1);
        let str = ''
        for (let t of content) {
            if (t['content']) {
                str += `| ${t['content']}`
            }

        }
        res.status(200).json({ welcomespeech: str })
    }
}