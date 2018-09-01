const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const { trimArray } = require('../../util/Util');
const activities = {
	PLAYING: 'Playing',
	STREAMING: 'Streaming',
	WATCHING: 'Watching',
	LISTENING: 'Listening to'
};

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'user-info',
			aliases: ['user', 'member', 'member-info'],
			group: 'info',
			memberName: 'user',
			description: 'Responds with detailed information on a user.',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					key: 'user',
					prompt: 'Which user would you like to get information on?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}

	async run(msg, { user }) {
		const embed = new MessageEmbed()
			.setThumbnail(user.displayAvatarURL())
			.addField('❯ Name', user.tag, true)
			.addField('❯ ID', user.id, true)
			.addField('❯ Discord Join Date', user.createdAt.toDateString(), true)
			.addField('❯ Bot?', user.bot ? 'Yes' : 'No', true);
		if (msg.channel.type === 'text') {
			try {
				const member = await msg.guild.members.fetch(user.id);
				const roles = member.roles.filter(role => role.id !== msg.guild.defaultRole.id);
				embed
					.setColor(member.displayHexColor)
					.setDescription(member.presence.activity
						? `${activities[member.presence.activity.type]} **${member.presence.activity.name}**`
						: '')
					.addField('❯ Server Join Date', member.joinedAt.toDateString(), true)
					.addField('❯ Nickname', member.nickname || 'None', true)
					.addField('❯ Highest Role',
						member.roles.highest.id === msg.guild.defaultRole.id ? 'None' : member.roles.highest.name, true)
					.addField('❯ Hoist Role', member.roles.hoist ? member.roles.hoist.name : 'None', true)
					.addField(`❯ Roles (${roles.size})`,
						roles.size ? trimArray(roles.map(role => role.name), 10).join(', ') : 'None');
			} catch (err) {
				embed.setFooter('Failed to resolve member, showing basic user information instead.');
			}
		}
		return msg.embed(embed);
	}
};
