const { EmbedBuilder } = require('discord.js');
const { antisetupCollection, anticonfigcollection } = require('../mongodb');

const antiLink = (client) => {
    const linkMap = new Map();
    console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAnti - Link System Active ✅\x1b[0m');

    client.on('messageCreate', async (message) => {
        if (!message.guild) return;

        const { author, content, channel, guild } = message;
        if (author.bot) return;

        try {
      
            const guildConfig = await antisetupCollection.findOne({ serverId: guild.id });
            const settings = guildConfig?.antiLink;
            if (!settings?.enabled) return;

            
            const antiConfig = await anticonfigcollection.findOne({ serverId: guild.id });
            const whitelistedChannels = antiConfig?.whitelisted_antilink_channels || [];
            const whitelistedLinkTypes = antiConfig?.whitelisted_antilink_types || [];
            const { ownerIds = [], adminIds = [] } = guildConfig || {};

            
            if (ownerIds.includes(author.id) || adminIds.includes(author.id)) return;

        
            if (whitelistedChannels.includes(channel.id)) return;

      
            const linkRegex = /https?:\/\/\S+/gi;
            const links = content.match(linkRegex);
            if (links) {
        
                const isWhitelistedLink = links.some(link =>
                    whitelistedLinkTypes.some(type => new URL(link).hostname.includes(type))
                );
                if (isWhitelistedLink) return; 

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('พบลิงค์ที่น่าสงสัย 😏')
                    .setDescription(`พบลิงค์ที่แนบมากับข้อความ`)
                    .addFields(
                        { name: 'ผู้ใช้', value: `${author} (${author.id})`, inline: true },
                        { name: 'ช่องข้อความ', value: `${channel} (${channel.id})`, inline: true },
                        { name: 'เนื้อหาข้อความ', value: content, inline: false },
                        { name: 'ลิงค์ที่พบ', value: links.join(', '), inline: false }
                    )
                    .setTimestamp();

                if (settings.mode === 'full') {
                    await message.delete();
                    await channel.send(`${author}, คุณได้ได้รับอนุญาติให้แนบลิงค์นะคะ !!`);
                    await logLinkDetection(guildConfig, embed);
                } else if (settings.mode === 'partial') {
                    const currentTime = Date.now();
                    const lastLinkTime = linkMap.get(author.id) || 0;

                    if (currentTime - lastLinkTime < settings.linkInterval) {
                        await message.delete();
                        await channel.send(`${author}, คุณสามารถส่งลิงค์ได้ทุกๆ ${settings.linkInterval / 1000} วินาทีนะคะ`);
                        await logLinkDetection(guildConfig, embed);
                    } else {
                        linkMap.set(author.id, currentTime);
                    }
                }
            }
        } catch (error) {
            //console.error('Error fetching server configuration or processing data:', error);
        }
    });

    const logLinkDetection = async (guildConfig, embed) => {
        const logChannel = client.channels.cache.get(guildConfig.logChannelId);
        if (logChannel) {
            try {
                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                //console.error('Failed to send log message:', error);
            }
        } else {
            //console.error('Log channel not found or bot lacks permissions.');
        }
    };
};

module.exports = antiLink;
