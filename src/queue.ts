import * as Discord from "discord.js";
import ytdl from "ytdl-core";
import YouTube = require("simple-youtube-api");
import { EventEmitter } from "events";

import Track from "./track";

export default class Queue extends EventEmitter {
    public dispatcher: Discord.StreamDispatcher;
    public connection: Discord.VoiceConnection;
    public current: Track;
    public playing: boolean = false;
    public queue: Track[] = [];

    constructor(public guild: Discord.Guild) {
        super()
    }

    public async join(channel: Discord.VoiceChannel): Promise<Discord.VoiceConnection> {
        if (channel && channel.connection) {
            return channel.connection;
        }

        this.connection = await channel.join();
        return this.connection;
    }

    public push(track: Track): void {
        this.queue.push(track);
    }

    public async play(channel: Discord.VoiceChannel): Promise<void> {
        if (this.playing) {
            console.log("DEBUG: ALREADY PLAYING");
            return;
        }
        const next: Track = this.next();
        this.current = next;

        if (!next) {
            console.log("DEBUG: EMPTY QUEUE, RETURNING");
            return;
        }

        const connection: Discord.VoiceConnection = await this.join(channel);
        const dispatcher: Discord.StreamDispatcher = connection.playStream(next.stream());

        this.dispatcher = dispatcher;
        this.connection = connection;

        this.current.setStart();
        this.playing = true;

        dispatcher.on('end', (reason: string): void => {
            this.playing = false;
            console.log("DEBUG: SONG ENDED, STOPPED PLAYING");
            
            this.emit("songEnded", channel, this.queue[0]);

            if (["Stream is not generating quickly enough.", ":skip:"].includes(reason)) {
                console.log("DEBUG: Attempting to replay");
                this.play(channel);
            } else {
                this.playing = false;
                this.dispatcher = null;
            }
        });
        dispatcher.on('error', console.error)
    }

    public skip() {
        this.dispatcher.end(":skip:");
    }

    private next(): Track {
        if (this.queue[0])
            return this.queue.shift();

        return null;
    }
}