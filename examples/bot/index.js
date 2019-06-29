const Discord = require("discord.js");
const Magma = require("@ohinoki/magma");

const client = new Discord.Client();
const magma = new Magma.Client(client, [ { host: "localhost", port: 2333, password: "youshallnotpass" } ], 1);

const prefix = "!";

client.on("message", async (msg) => {
    if (!msg.guild || msg.system || msg.author.bot) {
        return;
    }

    if (!msg.content.startsWith(prefix)) {
        return;
    }

    let args = msg.content.substring(prefix.length).split(" ");
    let cmd = args.shift()

    if (cmd === "play") {
        if (!msg.member.voiceChannel) {
            msg.reply("Join a voice channel first.");
            return;
        }

        let queue = magma.getQueue(msg.guild);
        let track = await magma.resolve(args[0]);
        queue.push(track);
        msg.channel.send(`Added **${track.title}** to the queue!`)

        if (!queue.playing) {
            queue.play(msg.member.voiceChannel);
            msg.channel.send(`Now playing **${track.title}**`)
        }
    } else if (cmd === "skip") {
        let queue = magma.getQueue(msg.guild)
        queue.skip()
    }
});

client.login("token");