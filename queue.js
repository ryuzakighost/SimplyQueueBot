class Queue{
    //Creates an empty queue
    constructor(){
        this.queue = []
    }

    /*get queue(){
        return this.queue
    }
    set queue(obj){

    }*/
    add(id){
        this.queue.push(id) 
        console.log("Item added, ID: " + id) 
    }

    remove(id){
        this.queue.splice(this.queue.indexOf(id),1) 
        console.log("Item removed, ID: " + id)    
    }

    enqueue(id){
        if(this.queue.includes(id)){
            this.remove(id)
            return("removed")
        }
        else{
            this.add(id)
            return("added")
        }
    }

    kick(id){
        if(this.queue.includes(id)){
            this.remove(id)
            return "success"
        }
        else{
            console.log("ERR: Item not in queue")
            return "fail"
        }
    }
/*         if(this.queue.includes(id)){
            console.log("id " + id + " already in queue")
        }
        else{
            console.log("adding " + id + " to queue") */

}
module.exports.Queue = Queue;