const Discord = require("discord.js");
const Beam = require("@ohinoki/beam");

const client = new Discord.Client();
const beam = new Beam.Client(client, [ { host: "localhost", port: 2333, password: "youshallnotpass" } ], 1);

const prefix = "!";

client.on("message", async (msg) => {
    if (!msg.guild || msg.system || msg.author.bot) {
        return;
    }

    if (!msg.content.startsWith(prefix)) {
        return;
    }

    let args = msg.content.substring(prefix.length).split(" ");
    let cmd = args.shift();

    if (cmd === "play") {
        if (!msg.member.voiceChannel) {
            msg.reply("Join a voice channel first.");
            return;
        }
      
        let data = await beam.resolve(args[0], cmd.guild.member(cmd.author));
        queue.push(data.tracks[0]);
        msg.channel.send(`Added **${data.tracks[0].title}** to the queue!`)

        if (!queue.playing) {
            queue.play(msg.member.voiceChannel);
            msg.channel.send(`Now playing **${data.tracks.title}**`)
        }
    } else if (cmd === "skip") {
        let queue = beam.getQueue(msg.guild);
        queue.skip();

    }
});

client.login("token");
