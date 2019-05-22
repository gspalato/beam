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


    /**
     * Returns the track fetched from the YouTube link.
     *     Client.resolve("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
     *
     * @param {String} input The YouTube URL.
     * @returns {Track}
     */
    public async resolve(input: string): Promise<Track> {
        const video = await this.youtube.getVideo(input);
        const track: Track = new Track(video);

        return track;
    }


    /**
     * Returns the queue for the given guild. If it doesn't exist, one is created and returned.
     *     Client.getQueue(msg.guild);
     *
     * @param {Discord.Guild} guild
     * @returns {Queue}
     */
    public getQueue(guild: Discord.Guild): Queue {
        if (this.queues.has(guild.id)) {
            return this.queues.get(guild.id);
        }

        const queue: Queue = new Queue(guild);
        this.queues.set(guild.id, queue);

        return queue;
    }
}