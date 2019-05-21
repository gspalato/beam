import * as YouTube from "simple-youtube-api";

import { Readable } from "stream";

export default class Track {
    public url: string;
    public title: string;
    public stream: Readable;
    public length: number;
    public startedAt: number;
    public thumbnail: string;

    constructor(video: YouTube.video) {
        this.url = video.url;
        this.title = video.title;
        this.length = video.durationSeconds;
        this.startedAt = 0;
        this.thumbnail = video.thumbnails.default.url;
    }


    /**
     * Sets the timestamp of when the track started playing
     * 
     * @returns {void}
     */
    public setStart(): void {
        this.startedAt = Date.now();
    }


    /**
     * Returns the current position of the song in seconds.
     * 
     * @returns {number} The position of the song in seconds.
     */
    public position(): number {
        return Math.floor((Date.now() - this.startedAt) / 1000);
    }
}