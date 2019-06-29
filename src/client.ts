import * as Lavalink from "discord.js-lavalink";
import * as Discord from "discord.js";
import fetch from "node-fetch";
import * as url from "url";


import Queue from "./queue";
import Track from "./track";

export default class Client {
    public lavalink = new Lavalink.PlayerManager(this.client, this.nodes, { user: this.client.user.id, shards: this.shards });
    public queues: Map<string, Queue> = new Map();

    constructor(
        public client: Discord.Client, 
        public nodes: { host: string, port: number, password: string }[],
        public shards: number
    ) {}


    /**
     * Returns the track fetched from the YouTube link.
     *     Client.resolve("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
     * 
     * @param {String} input The YouTube URL.
     * @returns {Track}
     */
    public async resolve(input: string): Promise<Track> {
        const node = this.nodes[0];

        const params = new url.URLSearchParams();
        params.append("identifier", `ytsearch:${input}`);

        let tracks = await fetch(`http://${node.host}:${node.port}/loadtracks?${params.toString()}`, { headers: { Authorization: node.password } })
            .then(res => res.json())
            .then(data => data.tracks)
            .catch(err => {
                console.error(err);
                return null;
            });

        if (tracks) {
            let result = tracks[0];

            let track = new Track(result.track, result.info.title, result.info.length, 0);
            return track;
        } else
            throw new Error("Couldn't search.")
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

        const queue: Queue = new Queue(this, guild);
        this.queues.set(guild.id, queue);

        return queue;
    }
}