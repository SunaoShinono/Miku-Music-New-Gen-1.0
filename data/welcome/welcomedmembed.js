const { EmbedBuilder } = require('discord.js');

module.exports = function createWelcomeDMEmbed(member) {
    const username = member.user.username;
    const serverName = member.guild.name;
    const avatar = member.user.displayAvatarURL({ dynamic: true });

    return new EmbedBuilder()
        .setTitle(`👋 ยินดีต้อนรับสู่ ${serverName} ค่ะ`)
        .setDescription(`โย่วว ${username}, ดีใจจังที่เจอคุณ ขอให้สนุกกับ Server ของเรานะคะ`)
        .setColor('#00e5ff')
        .setThumbnail(avatar)
        .addFields(
            { name: '📅 เข้าร่วมเมื่อ', value: new Date().toDateString(), inline: true },
            { name: '📝 ข้อมูล', value: 'สำรวจช่องต่างๆ, ติดตามกฎของ server, และไปทักทายผู้คนกัน' }
        )
        .setFooter({ text: `${serverName} Community` })
        .setTimestamp();
};
