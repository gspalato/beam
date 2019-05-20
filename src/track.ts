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

    public setStart(): void {
        this.startedAt = Date.now();
    }

    public stream() {
        return ytdl(this.url);
    }

    public position(): number {
        return (Date.now() - this.startedAt) / 1000;
    }
}