import ytdl from "ytdl-core";
import * as YouTube from "simple-youtube-api";

export default class Track {
    public url: string;
    public title: string;
    public startedAt: number;
    public thumbnail: string;

    constructor(video: YouTube.video) {
        this.url = video.url;
        this.title = video.title;
        this.startedAt = 0;
        this.thumbnail = video.thumbnails.default;
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
     * Returns a stream of the music.
     * 
     * @returns {ReadableStream<any>} The stream used to play the music.
     */
    public stream() {
        return ytdl(this.url);
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