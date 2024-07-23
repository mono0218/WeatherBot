const {discord, Client,Intents, Interaction, ThreadChannel, MessageEmbed, User} = require("discord.js")
const axios = require("axios")
require("dotenv").config()

let lastRequestMin,requestCount
let requestLimit = 15

module.exports = async function(location,day,is_notif){
    let responseArray = []

    console.log(requestCount)

    if(lastRequestMin!==new Date().getMinutes()){
        lastRequestMin = new Date().getMinutes()
        requestCount = 0
    }

    if(requestCount<requestLimit || is_notif){

        try{
            var result = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.API_KEY}&q=${location}&days=${day}&aqi=no&alerts=no`) 
            if(result.statusCode != 200){
                let embed = new MessageEmbed()
                    .setTitle("エラー")
                    .setDescription(error.statusCode+"："+error.response.data.message)
                    .setColor(0xFF0000)
            }
        }catch(error){

            let embed = new MessageEmbed()
                .setTitle("エラー")
                .setDescription(error.response.data.error.code+"："+error.response.data.error.message)
                .setColor(0xFF0000)
            
            responseArray.push(embed)
            
            return

        }finally{
            requestCount=is_notif?requestCount:requestCount+1
        }
        
        
        const data = result.data

        let location_name = `${data.location.country}/${data.location.name}`
        let last_update = data.current.last_updated

        let temp = data.current.temp_c
        let weather = data.current.condition.text
        let icon_url = "https:"+data.current.condition.icon
        let windspeed = data.current.wind_kph


        if(day){

            let embed = new MessageEmbed()
                .setTitle("気象情報")
                .setDescription(`${location_name}の、${day}日間の気象情報です。`)
                .setColor(0x00FF00)

            responseArray.push(embed)


            for(var i=0;i<day;i++){
                let date = data.forecast.forecastday[i].date
                let weather = data.forecast.forecastday[i].day.condition.text
                let icon_url = "https:"+data.forecast.forecastday[i].day.condition.icon
                let maxtemp = data.forecast.forecastday[i].day.maxtemp_c
                let mintemp = data.forecast.forecastday[i].day.mintemp_c
                let max_windspeed = data.forecast.forecastday[i].day.maxwind_kph

                let embed = new MessageEmbed()
                    .addFields({name:date,value:`天気：${weather}\n最高気温：${maxtemp}\n最低気温：${mintemp}\n最大風速：${Math.floor(max_windspeed/3.6)}m/s`})
                    .setThumbnail(icon_url)
                    .setTimestamp(last_update)
                
                responseArray.push(embed)

            }
        }else{
            let embed = new MessageEmbed()
                .setTitle("気象情報")
                .setDescription(`${location_name}の、現在の気象情報です。`)
                .setColor(0x00FF00)
                .addFields({name:"現在",value:`天気：${weather}\n現在の気温：${temp}\n風速：${Math.floor(windspeed/3.6)}m/s`})
                .setThumbnail(icon_url)
                .setTimestamp(last_update)

            responseArray.push(embed)


        }

    }else{
        let embed = new MessageEmbed()
            .setTitle("Access Limit")
            .setDescription("現在アクセスが集中しています。時間をおいて再度お試しください。")
            .setColor(0xFF0000)
        
        responseArray.push(embed)
    }

    return responseArray

}
