const { EmbedBuilder } = require('discord.js');

module.exports = function createLeaveDMEmbed(member) {
    return new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('👋 ลาก่อน หวังว่าเราจะได้พบกันอีกนะคะ')
        .setDescription(`เราจะจดจำคุณตลอดไป **${member.guild.name}**.\nเราหวังว่าจะได้พบกับคุณอีกครั้งนะคะ`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
};
