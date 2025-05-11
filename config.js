const { ActivityType } = require('discord.js');

module.exports = {
  ownerId: '705260973669482507',
  status: {
    rotateDefault: [
      { name: 'Gif ที่นายท่านขยันยัดเข้ามา', type: ActivityType.Watching },
      { name: 'Euro Truck Simulator 2', type: ActivityType.Playing },
      { name: 'Snowrunner', type: ActivityType.Playing },
      { name: 'Euro Truck Simulator 2', type: ActivityType.Playing },
      { name: 'on YouTube', type: ActivityType.Streaming, url: 'https://www.youtube.com/@pstradio5305' },
      { name: 'Spotify', type: ActivityType.Listening },
      { name: 'Youtube Music', type: ActivityType.Listening },
    ],
    songStatus: true
  },
  spotifyClientId: "bddc81fcd0af46d9b05a278f8f9f9939",
  spotifyClientSecret: "ee11fa4a59bf4f64b5a6433839b49c02",
}
