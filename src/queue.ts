import * as Lavalink from "discord.js-lavalink";
import * as Discord from "discord.js";
import { EventEmitter } from "events";

import Track from "./track";
import { Client } from ".";

export default class Queue extends EventEmitter {
    public player: Lavalink.Player;
    public current: Track;
    public playing: boolean = false;
    public volume: number = .5;
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
        if (this.playing) {
            return;
        }
        
        const next: Track = this.next();
        this.current = next;

        if (!next) {
            this.playing = false;
            this.client.queues.delete(this.guild.id);
            this.client.lavalink.leave(this.guild.id);
            return;
        }

        const player: Lavalink.Player = await this.join(channel);

        this.emit("songStarted", channel, this.current);

        this.current.setStart();
        this.playing = true;

        player.play(next.id)

        player.once("end", (data: any): void => {
            this.playing = false;
            this.emit("songEnded", channel, this.queue[0]);

            if (!["REPLACED"].includes(data.reason)) {
                this.play(channel);
            }
        });

        player.once('error', console.error)
    }


    /**
     * Skips to the next song.
     *     Queue.skip();
     * 
     * @returns {void}
     */
    public skip(channel: Discord.VoiceChannel) {
        this.playing = false;
        this.play(channel);
    }


    /** 
     * Stops the player.
     *     Queue.stop();
     * 
     * @returns {void}
     */
    public stop() {
        this.player.stop();
        this.client.queues.delete(this.guild.id);
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