import { Readable } from "stream";

export default class BeamTrack {
    constructor(
        public id: string,
        public url: string,
        public title: string,
        public length: number,
        public startedAt: number,
        public thumbnail?: string,
        public issuer?: any
    ) {
        this.length = length / 1000
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