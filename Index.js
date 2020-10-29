
//Imports
const discord = require('discord.js')
const queue = require('./models/queue.js')
const channel = require('./models/channel.js')
const config = require('./config.json')
//const command = require('./src/commands.js')
//const utility = require('./src/utility.js')
var fs = require('fs');
//require('dotenv-flow').config()

//Const + Var Values 
const bot = new discord.Client()
let playerQueue = new queue.Queue()
const permissionsError = "You have insufficient permissions to use this command"
var prevMessage = ""
var prevMessageChannel = ""
var guild = null
var gameChannels = []
var playerFind = false


//Startup commands for the Bot
bot.on('ready', () => {
    console.info("Getting Bot Ready")
    //Sets the Guild and sets up channels
    if (config.guild != ""){
        guild = bot.guilds.cache.get(config.guild)
        console.info("Guild " + guild.name + " loaded")
        addChannel(config.gameRoomName + " 1")
    }

//check for mod role
//if mod role doesn't exist, create it  
    console.info(`Logged in as ${bot.user.tag}!\n`)
})

bot.login(config.token)

bot.on('message', msg => {
    //checks to see if message begins with prefix
    if(msg.content.startsWith(config.prefix)){

        //if guildID isn't set, set it
        if(config.guild === ""){
            config.guild = msg.guild.id
            fs.writeFile('./config.json',JSON.stringify(config),"utf8",(err) => {
                if (err) throw err
                console.log('Successfully written to config.json')})
            console.log("Guild ID set: " + config.guild)
            addChannel(config.gameRoomName + " 1")
        }

        /*Enqueue function
        - adds user to the queue if they don't exist in it
        - removes user from the queue if they are already in it*/
        if (msg.content === config.prefix + 'q'||msg.content === config.prefix + 'queue') {
            user = msg.author
            
            isInChat = false
            gameChannels.forEach(function(voiceChannel){
                if(voiceChannel.channel.members.has(user.id)){
                    isInChat = true
                }
            })
            if(isInChat === false){
                if(status === "added"){
                    printQueue(msg.channel,'User: <@!' + user.id +'> has been added to the queue')
                }
                else if(status === "removed"){
                    printQueue(msg.channel,'User: <@!' + user.id +'> has been removed from the queue')
                }
                else{
                    console.error('something went wrong adding user to queue')
                } 
            }
            else{
                msg.author.send("Hi <@!" + user.id +">, You can't add yourself to Queue if you are in a " + config.gameRoomName)
            }
            msg.delete()
        }

        /*Kick function
        - kicks user from the queue
        - This is a Mod Command*/
        else if(msg.content.startsWith(config.prefix + 'k ')) {
            if(msg.member.roles.cache.some(role => role.name === 'Mod')){
                id = msg.content.slice(3)
                kick(id,msg.channel)
                msg.delete()
            }
            else{
                console.error('permissions error for ' + msg.author.username)
                msg.reply(permissionsError)
                msg.delete()
            }
        }
        else if(msg.content.startsWith(config.prefix + 'kick ')) {
            if(msg.member.roles.cache.some(role => role.name === 'Mod')){
                id = msg.content.slice(6)
                kick(id,msg.channel)
                msg.delete()
            }
            else{
                console.error('permissions error for ' + msg.author.username)
                msg.author.send(permissionsError)
                msg.delete()
            }
        }

        /*Next Function
        - Starts messaging down the queue - direct messaging
        - Each player gets 1 min to respond to the message before it moves onto the next
        - once a user joins if no space left stop

        /*Print Function
        - prints the current queue in chat*/
        else if(msg.content === config.prefix + 'p' || msg.content === config.prefix + 'print'){
            msg.delete()
            printQueue(msg.channel,"")
            console.log("Queue Printed")
            
        }
    }
})

bot.on("voiceStateUpdate", (oldMember, newMember)=> { 
    let oldVoice = oldMember.channelID
    let newVoice = newMember.channelID
    //if user enters a voice chat
    gameChannels.forEach(function(channel){
        console.log(newVoice)
        console.log(channel.channel.id)
        if(newVoice === channel.channel.id && playerQueue.queue.includes(newMember.id)){
            kick("<@!"+newMember.id+">",guild.channels.cache.get(config.defaultChat))
        }
    })
    //console.log(oldVoice)
    //console.log(newVoice)
    if (oldVoice != newVoice) {
      if (oldVoice == null) {
        console.log("User joined!")
        //remove them from queue

      } else if (newVoice == null) {
        console.log("User left!")
        //find new user if list not empty

      } else {
        console.log("User switched channels!")
      }
    }
  })

function stripMention(id){
    id = id.replace(/<@!+/,'')
    id = id.replace(/>/,'')
    return id
}

//See Kick Function
async function kick(username,channel){
    id = stripMention(username)
    playerQueue.kick(id)
    printQueue(channel,'User: ' + username +' has been removed from the queue')
}

//See Print Function
async function printQueue(channel, msg = ""){
    printString = msg + "\n>>> Queue:\n"
    if(playerQueue.queue.length === 0){
        printString = msg + "\n>>> There is no-one here\n"
    }
    else{
        for(i=0;i<playerQueue.queue.length;i++){
            line = i+1 + ". <@!" + playerQueue.queue[i] + ">\n"
            printString = printString + line
        }
     }
    msgManager(printString,channel) 
}

//sends message and deletes previous message
async function msgManager(msg,channel) {
    if(prevMessage != ""){
        //delete previous message
        bot.channels.cache.get(prevMessageChannel).messages.fetch(prevMessage).then(message => message.delete())
    }
    channel.send(msg).then(sent => {
        prevMessage = sent.id
        prevMessageChannel = channel.id
    })
}

//check for game room channel
//if one exists note channel ID, else make a game room channel
async function addChannel(channelName){
    if(!(guild.channels.cache.find(c => c.name === channelName))){
        console.log("Creating " + channelName)
        guild.channels.create(channelName,{type: 'voice', userLimit: '10' })
            .then(createdChannel => {
                console.log(createdChannel.name + " Created")
                gameChannels.push(new channel.Channel(createdChannel,true))
            })
            .catch(console.error)
    }
    else {
        fetchedChannel = guild.channels.cache.find(c => c.name === channelName)
        gameChannels.push(new channel.Channel(fetchedChannel,false))
        console.log("Channel Found " + channelName)
    }
}