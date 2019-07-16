import * as Lavalink from "discord.js-lavalink";
import * as Discord from "discord.js";
import { EventEmitter } from "events";

import Track from "./track";


export default class BeamQueue extends EventEmitter {
    public player: Lavalink.Player;
    public current: Track;
    public queue: Track[] = [];

    constructor(public client, public guild: Discord.Guild) {
        super()
    }


    /**
     * Joins a voice channel.
     *     Queue.join(msg.member.voiceChannel);
     *
     * @param {Discord.VoiceChannel} channel The voice channel.
     * @returns {Promise<Discord.VoiceConnection>}
     */
    public async join(channel: Discord.VoiceChannel): Promise<Lavalink.Player> {
        if (this.player)
            return this.player;

        let player = this.client.lavalink.join({
            guild: channel.guild.id,
            channel: channel.id,
            host: this.client.nodes[0].host
        });
        this.player = player;

        return player;
    }


    /**
     * Push a new track to the queue.
     *     Queue.push(Client.resolve("https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
     *
     * @param {Track} track
     * @returns {void}
     */
    public push(track: Track): void {
        this.queue.push(track);
    }


    /**
     * Plays music on the designated music channel.
     *     Queue.play(msg.member.voiceChannel);
     *
     * @param {Discord.VoiceChannel} channel The voice channel.
     * @return {Promise<void>}
     *
     */
    public async play(channel: Discord.VoiceChannel): Promise<void> {
        if (!this.queue[0]) {
            this.client.queues.delete(this.guild.id);
            this.client.lavalink.leave(this.guild.id);
            return;
        }
        const next: Track = this.next();
        this.current = next;

        const player: Lavalink.Player = await this.join(channel);

        this.emit("songStarted", channel, this.current);

        this.current.setStart();

        player.play(next.id)

        if (!player.listeners("end")[0]) {
            player.on("end", (data: any): void => {
                this.emit("songEnded", channel, this.queue[0]);

                if (!["REPLACED"].includes(data.reason)) {
                    this.play(channel);
                }
            });
        }

        player.on('error', console.error)
    }


    /**
     * Skips to the next song.
     *     Queue.skip();
     *
     * @returns {void}
     */
    public skip(channel: Discord.VoiceChannel) {
        this.play(channel);
    }


    /**
     * Stops the player.
     *     Queue.stop();
     *
     * @returns {void}
     */
    public stop() {
        if (this.player)
            this.player.destroy();
        this.client.queues.delete(this.guild.id);
    }


    /**
     * Shuffles the queue.
     *     Queue.shuffle();
     * 
     * @returns {void}
     */
    public shuffle(): void {
        let copy: Track[] = Array.from(this.queue)
        let shuffled: Track[] = [];
        let n: number = copy.length;
        let i;

        while (n) {
            i = Math.floor(Math.random() * copy.length);

            if (i in copy) {
                shuffled.push(copy[i]);
                delete copy[i];
                n--;
            }   
        }

        this.queue = shuffled;
    }


    /**
     * Shifts and returns the next song in the queue
     *     Queue.next();
     *
     * @returns {Track | null}
     */
    private next(): Track {
        if (this.queue[0])
            return this.queue.shift();

        return null;
    }
}