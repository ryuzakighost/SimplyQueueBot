
//Imports
const discord = require('discord.js')
const queue = require('./queue.js')
//require('dotenv').config();

//Const + Var Values 
const token = "NzY5MDQ2MDU3NzUyODU0NTM4.X5JT9A.3p-4fhKp_3QoUAYIKeaPk-bVWvk"//token.env.TOKEN;
const bot = new discord.Client()
let playerQueue = new queue.Queue()
const permissionsError = "You have insufficient permissions to use this command"
var prevMessage = ""
var prevMessageChannel = ""

bot.on('ready', () => {
console.info(`Logged in as ${bot.user.tag}!`)
})

bot.login(token)

bot.on('message', msg => {

    /*Enqueue function
    - adds user to the queue if they don't exist in it
    - removes user from the queue if they are already in it*/
    if (msg.content === '!q'||msg.content === '!queue') {
        user = msg.author
        status = playerQueue.enqueue(user.id)
        if(status === "added"){
            printQueue(msg.channel,'User: <@!' + user.id +'> has been added to the queue')
        }
        else if(status === "removed"){
            printQueue(msg.channel,'User: <@!' + user.id +'> has been removed from the queue')
        }
        else{
            console.error('something went wrong adding user to queue')
        }
        msg.delete()
        
    }

    /*Kick function
    - kicks user from the queue
    - This is a Mod Command*/
    else if(msg.content.startsWith('!k ')) {
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
    else if(msg.content.startsWith('!kick ')) {
        if(msg.member.roles.cache.some(role => role.name === 'Mod')){
            id = msg.content.slice(6)
            kick(id,msg.channel)
            msg.delete()
        }
        else{
            console.error('permissions error for ' + msg.author.username)
            msg.reply(permissionsError)
            msg.delete()
        }
    }

    /*Print Function
    - prints the current queue in chat*/
    else if(msg.content === '!p' || msg.content === '!print'){
        msg.delete()
        printQueue(msg.channel,"")
        console.log("Queue Printed")
        
    }
})

bot.on("voiceStateUpdate", (oldMember, newMember)=> { 
    let oldVoice = oldMember.channelID
    let newVoice = newMember.channelID
    console.log(oldVoice)
    console.log(newVoice)
    if (oldVoice != newVoice) {
      if (oldVoice == null) {
        console.log("User joined!")
      } else if (newVoice == null) {
        console.log("User left!")
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
    console.log(msg)
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
    console.log("prevMessage: " + prevMessage)
    if(prevMessage != ""){
        //delete previous message
        bot.channels.cache.get(prevMessageChannel).messages.fetch(prevMessage).then(message => message.delete())
    }
    channel.send(msg).then(sent => {
        prevMessage = sent.id
        prevMessageChannel = channel.id
    })
}
