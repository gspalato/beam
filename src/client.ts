import * as Discord from "discord.js";
import * as url from "url";
const YouTube = require("simple-youtube-api");
// import * as YouTube from "simple-youtube-api";

import Queue from "./queue";
import Track from "./track";

export default class Client {
    public youtube;
    public queues: Map<string, Queue> = new Map();

    constructor(public client: Discord.Client, key: string) {
        this.youtube = new YouTube(key);
    }

    public async resolve(input: string): Promise<Track> {
        const video = await this.youtube.getVideo(input);
        const track: Track = new Track(video);

        return track;
    }

    public getQueue(guild: Discord.Guild): Queue {
        if (this.queues.has(guild.id)) {
            return this.queues.get(guild.id);
        }

        const queue: Queue = new Queue(guild);
        this.queues.set(guild.id, queue);

        return queue;
    }
}