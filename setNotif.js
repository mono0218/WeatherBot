const {discord, Client,Intents, Interaction, ThreadChannel, MessageEmbed, User} = require("discord.js")
const fs = require("fs")
require("date-utils")
module.exports = async function(interaction,filePath){

    let setting = interaction.options.getString("setting")
    let inputLocation = interaction.options.getString("locations")
    let locations
    if(inputLocation){
        locations = inputLocation.split(",").filter(n=>n!=="")
    }
    let channelID
    try{channelID = interaction.channel.id.toString()}catch(err){channelID = null}

    const isChannel = channelID!==null

    let r_json = require(filePath)
    let embed = new MessageEmbed();

    if(isChannel){
        if(setting=="SET"){

            if(locations){
                r_json.channels[channelID] = locations
                embed.setTitle("SET")
                .setDescription(`通知地点を"${locations.toString()}"に設定しました。\n毎朝6:30に通知を行います。`)
                .setColor(0x00ff00)

            }else{
                embed.setTitle("ERROR")
                .setDescription("地点を入力してください。")
                .setColor(0xff0000)
            }

        }else if(setting=="UNSET"){
            delete r_json.channels[channelID]
            embed.setTitle("UNSET")
            .setDescription("通知をOFFにしました。")
            .setColor(0x00ff00)
        }else{
            embed.setTitle("INFO")
            .setDescription(`登録地点は ${r_json.channels[channelID].toString()}です。`)
            .setColor(0x00ff00)
        }
        fs.writeFileSync(filePath,JSON.stringify(r_json))
    }else if(setting=="INFO"){
        embed.setTitle("ERROR")
        .setDescription("このコマンドはDMでは使用できません。")
        .setColor(0xff0000)
    }

    return embed
}