import * as Lavalink from "discord.js-lavalink";
import * as Discord from "discord.js";
import fetch from "node-fetch";
import * as url from "url";

import BeamQueue from "./queue";
import BeamTrack from "./track";


interface INode { 
    host: string;
    port: number; 
    password: string; 
}

interface IData {
    info?: {
        selectedTrack: number;
        name: string;
    };
    type: string;
    tracks: BeamTrack[];
}

export default class BeamClient {
    public lavalink = new Lavalink.PlayerManager(this.client, this.nodes, { user: this.client.user.id, shards: this.shards });
    public queues: Map<string, BeamQueue> = new Map();

    constructor(
        public client: Discord.Client, 
        public nodes: INode[],
        public shards: number
    ) {}


    /**
     * Returns the track fetched from link.
     *     Client.resolve("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
     * 
     * @param {String} search URL or query
     * @param {any} issuer Any kind of value that represents who requested the video.
     * @returns {IData} 
     */
    public async resolve(search: string, issuer: any): Promise<IData> {
        const node = this.nodes[0];

        const regex = [
            /^(https?:\/\/)?(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)$/,
            /^(https?:\/\/)?(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|playlist\?list=|\&v=)(&list=)?([^#\&\?]*).*$/,
            /^(https?:\/\/)?(www.)?(m\.)?soundcloud\.com\/[\w\-\.]+(\/)+[\w\-\.]+$/,
            /^(https?:\/\/)?(clips\.)?twitch\.tv\/(\S+)$/
        ];

        let param;
        let r = new RegExp(regex.map(r => r.source).join("|"));
        if (r.test(search))
            param = search;
        else
            param = `ytsearch:${search}`;

        const params = new url.URLSearchParams();
        params.append("identifier", param);

        let data = await fetch(`http://${node.host}:${node.port}/loadtracks?${params.toString()}`, { headers: { Authorization: node.password } })
            .then(res => res.json())
            .catch(err => {
                console.error(err);
            });

        if (data && data.tracks) {
            let result = data.tracks.map(
                (t) => new BeamTrack(t.track, t.info.uri, t.info.title, t.info.length, 0, null, issuer)
            );
            
            return {
                info: data.playlistInfo,
                type: (data.loadType === "PLAYLIST_LOADED") ? "PLAYLIST" : "VIDEO",
                tracks: result,
            };
        } else
            throw new Error("SEARCH_FAILED");
    }


    /**
     * Returns the queue for the given guild. If it doesn't exist, one is created and returned.
     *     Client.getQueue(msg.guild);
     *
     * @param {Discord.Guild} guild
     * @returns {Queue}
     */
    public getQueue(guild: Discord.Guild): BeamQueue {
        if (this.queues.has(guild.id)) {
            return this.queues.get(guild.id);
        }

        const queue: BeamQueue = new BeamQueue(this, guild);
        this.queues.set(guild.id, queue);

        return queue;
    }
}