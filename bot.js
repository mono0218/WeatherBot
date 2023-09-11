const {discord, Client,Intents, Interaction, ThreadChannel, MessageEmbed, User} = require("discord.js")
const client = new Client({intents:Intents.FLAGS.GUILDS|Intents.FLAGS.GUILD_MESSAGES})
require("dotenv").config()

const getInfo = require("./getInfo.js")
const setNotif =require("./setNotif.js")


const filePath="./notif.json"

client.on("ready",async () =>{
    client.user.setActivity(`${client.guilds.cache.size}個のサーバーに参加しています。`)

    const data = [
        {
            name:"weather",
            type:"CHAT_INPUT",
            description:"気象情報を取得します。",
            options:[
                {
                    name:"location",
                    type:"STRING",
                    description:"取得したい地域を入力してください。",
                    required:true,
                },
                {
                    name:"days",
                    type:"NUMBER",
                    description:"取得したい日数を入力してください。",
                    min_value:1,
                    max_value:10,
                    required:false,
                }
            ]
        },{
            name:"notif",
            type:"CHAT_INPUT",
            description:"通知の設定をします。ONの場合毎朝7時に通知を行います。",
            options:[
                {
                    name:"setting",
                    description:"有効、無効の設定",
                    type:"STRING",
                    choices:[
                        {
                            name:"SET",
                            value:"SET"
                        },
                        {
                            name:"UNSET",
                            value:"UNSET"
                        },
                        {
                            name:"INFO",
                            value:"INFO"
                        }
                    ]
                },
                {
                    name:"locations",
                    description:"通知を行う地点を設定します。複数指定する場合はカンマ(,)で区切ってください。(※UNSETの場合は無視されます。)",
                    type:"STRING",
                }
            ]
        }
    ]

    await client.application.commands.set(data,"966218430711754802")
    console.log("Discord.js version:"+require("discord.js").version)
    console.log(client.user.tag+"にログインしました")
})

let last = null
let done = false
setInterval(async()=>{
    let date = new Date()
    let curTime = date.toFormat("HH24:MI")

    if(curTime!==last){
        done = false
        last = null
    }
    
    if(curTime=="06:30"&&!done){
        last = curTime
        done = true
        let r_json = require("./notif.json")

        for(const [id,locations] of Object.entries(r_json.channels)){
            if(locations){
                let response = []
                for(let elem of locations){
                    let res = await getInfo(elem,1,true)
                    res.forEach(elem=>{
                        response.push(elem)
                    })
                    
                }
                try{
                    client.channels.cache.get(id).send({embeds:response})
                }catch(err){
                    
                }
                
            }

        }
        
    }
},10000)



client.on("interactionCreate", async (interaction)=>{
    client.user.setActivity(`${client.guilds.cache.size}個のサーバーに参加しています。`)
    if (interaction.isCommand){
        if(interaction.commandName==="weather"){
            await interaction.deferReply()
            let location = interaction.options.getString("location")
            let day = interaction.options.getNumber("days")

            let response = await getInfo(location,day)
            await interaction.editReply({embeds:response})
            
        }
        else if(interaction.commandName==="notif"){
            
            await interaction.deferReply()

            let embed = await setNotif(interaction,filePath)
            
            await interaction.editReply({embeds:[embed]})

        }
    }
})







client.login(process.env.TOKEN)

