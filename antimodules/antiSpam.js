const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { antisetupCollection, anticonfigcollection } = require('../mongodb');

const antiSpam = (client) => {
    const spamMap = new Map();
    console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAnti - Spam System Active ✅\x1b[0m');

    client.on('messageCreate', async (message) => {
        if (!message.guild) return;

        const { author, content, channel, guild } = message;
        if (author.bot) return;

        try {
            const guildConfig = await antisetupCollection.findOne({ serverId: guild.id });
            const antiSpamSettings = guildConfig?.antiSpam;
            if (!antiSpamSettings?.enabled) return;

            const antiConfig = await anticonfigcollection.findOne({ serverId: guild.id });
            const whitelistedChannels = antiConfig?.whitelisted_antiSpam_channels || [];
            const blockedWords = antiConfig?.blocked_words || [];
            const { ownerIds = [], adminIds = [] } = guildConfig || {};

         
            if (ownerIds.includes(author.id) || adminIds.includes(author.id) || whitelistedChannels.includes(channel.id)) return;

            const currentTime = Date.now();
            const userSpamData = spamMap.get(author.id) || { lastMessage: currentTime, messageCount: 0, blockedWordCount: 0 };

      
            const lowerCaseContent = content.toLowerCase();
            const containsBlockedWords = blockedWords.some(word => lowerCaseContent.includes(word.toLowerCase()));

            if (containsBlockedWords) {
                await message.delete();
                await channel.send(`${author}, using blocked words is not allowed!`);

                userSpamData.blockedWordCount += 1;

                if (userSpamData.blockedWordCount >= 3) {
                    const member = message.guild.members.cache.get(author.id);
                    if (member) {
                        await member.timeout(antiSpamSettings.duration, 'Using blocked words');
                        const embed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Anti-Spam: ลงโทษ')
                            .setDescription(`ผู้ใช้ ${author.tag} ได้ถูกกำหนดให้หมดเวลา เนื่องใช้คำที่ไม่เหมาะสม`)
                            .addFields(
                                { name: 'ผู้ใช้', value: `${author.tag} (${author.id})`, inline: true },
                                { name: 'คำต้องห้ามที่ใช้', value: `${userSpamData.blockedWordCount}`, inline: true },
                                { name: 'ระยะเวลาที่ถูกกำพหรดให้หมดเวลา', value: `${antiSpamSettings.duration / 1000} seconds`, inline: true },
                                { name: 'พิมพ์คำต้องห้ามเมื่อ', value: new Date(currentTime).toLocaleString(), inline: false }
                            )
                            .setTimestamp();

                        const logChannel = message.guild.channels.cache.get(guildConfig.logChannelId);
                        if (logChannel) {
                            await logChannel.send({ embeds: [embed] });
                        } else {
                            //console.error('Log channel not found or bot lacks permissions.');
                        }
                    }

                    spamMap.delete(author.id);
                }
                return;
            }

            if (currentTime - userSpamData.lastMessage < antiSpamSettings.timeWindow) {
                userSpamData.messageCount += 1;
            } else {
                userSpamData.messageCount = 1;
            }

            userSpamData.lastMessage = currentTime;
            spamMap.set(author.id, userSpamData);

          
            if (userSpamData.messageCount > antiSpamSettings.messageCount) {
                if (antiSpamSettings.action === 'warn') {
                    await channel.send(`${author}, please stop spamming!`);
                    logSpamWarning(guildConfig, author, userSpamData.messageCount, currentTime);
                } else if (antiSpamSettings.action === 'timeout') {
                    const member = message.guild.members.cache.get(author.id);
                    if (member) {
                        await member.timeout(antiSpamSettings.duration, 'Spamming');
                        logSpamTimeout(guildConfig, author, userSpamData.messageCount, currentTime, antiSpamSettings.duration);
                    }
                }

                spamMap.delete(author.id);
            }
        } catch (error) {
            //console.error('Error fetching server configuration or processing data:', error);
        }
    });

    const logSpamWarning = async (guildConfig, author, messageCount, currentTime) => {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Anti-Spam: เตือน')
            .setDescription(`ผู้ใช้ ${author.tag} ได้ถูกเตือนแล้ว เนื่องจาก สแปมข้อความ`)
            .addFields(
                { name: 'ผู้ใช้', value: `${author.tag} (${author.id})`, inline: true },
                { name: 'ข้อความที่ส่ง', value: `${messageCount}`, inline: true },
                { name: 'เตือนเมื่อ', value: new Date(currentTime).toLocaleString(), inline: false }
            )
            .setTimestamp();

        const logChannel = client.channels.cache.get(guildConfig.logChannelId);
        if (logChannel) {
            try {
                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Failed to send log message:', error);
            }
        } else {
            //console.error('Log channel not found or bot lacks permissions.');
        }
    };

    const logSpamTimeout = async (guildConfig, author, messageCount, currentTime, duration) => {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Anti-Spam: ลงโทษ: กำหนดหมดเวลา')
            .setDescription(`ผู้ใช้ ${author.tag} ถูกกำหนดให้หมดเวลา เนื่องจาก สแปมข้อความ`)
            .addFields(
                { name: 'ผู้ใช้', value: `${author.tag} (${author.id})`, inline: true },
                { name: 'ข้อความที่ส่ง', value: `${messageCount}`, inline: true },
                { name: 'ระยะเวลาที่กำหนดให้หมดเวลา', value: `${duration / 1000} seconds`, inline: true },
                { name: 'ลงโทษเมื่อ', value: new Date(currentTime).toLocaleString(), inline: false }
            )
            .setTimestamp();

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

module.exports = antiSpam;
