import database from './database';

/*Kreiranje ticketa
 */
function newTicket(req, res){
    let uid = req.body.uid, // User Id -unos
        title = req.body.title, // unos naslova ticketa
        department = req.body.department,
        strange = req.body.strange,
        message = req.body.message, // poruka ticketa
        attachments = req.body.attachments; // files url

    if(!uid) {
        return res.status(400).json({ status: false, code: 400, require: 'uid' });
    } else if(!title){
        return res.status(400).json({ status: false, code: 400, require: 'title' });
    } else if(!message){
        return res.status(400).json({ status: false, code: 400, require: 'message' });
    } else {
        new database.ticket({
            uid, title, department, strange
        }).save()
        .then(ticket=>{
            return new database.messages({ tid: ticket._id, uid, message, attachments }).save();
        }).then(message=>{
            res.status(200).json({ status: true, code: 200, id: message['tid'] || null });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
    }
}

/**
 * Poruka u ticketu
 */
function newMessage(req, res){
    let uid = req.body.uid, // USer id
        tid = req.body.tid, // Ticket id
        message = req.body.message, 
        attachments = req.body.attachments; // files url
    
    if(!uid) {
        return res.status(400).json({ status: false, code: 400, require: 'uid' });
    } else if(!tid){
        return res.status(400).json({ status: false, code: 400, require: 'tid' });
    } else if(!message){
        return res.status(400).json({ status: false, code: 400, require: 'message' });
    } else {
        database.ticket.findById(tid).exec()
        .then(ticket=>{
            if(ticket == null) {
                res.status(503).json({ status: false, code: 503, ticket: null });
            } else if(ticket['enable'] == false) {
                return database.ticket.updateOne({ _id: tid }, { enable: true }).exec();
            } else {
                return Promise.resolve();
            }
        }).then(()=>{
            return new database.messages({ tid, uid, message, attachments }).save();
        }).then(message=>{
            res.status(200).json({ status: true, code: 200, id: message['tid'] || null });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
    }
}

/**
 * Promjena statusa
 */
function changeStatus(req, res){
    let tid = req.body.tid, // Ticket ID
        status = req.body.status; // Status rijesen/nije rijesen

    if(!tid){
        return res.status(400).json({ status: false, code: 400, require: 'tid' });
    } else if(!status){
        return res.status(400).json({ status: false, code: 400, require: 'status' });
    } else if(typeof status != 'boolean'){
        return res.status(400).json({ strange: false, code: 400, bad: 'status', type: 'boolean' });
    } else {
        database.ticket.updateOne({ _id: tid }, { enable: status }).exec()
        .then(()=>{
            return res.status(200).json({ status: true, code: 200 });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
    }
}

/**
 * Prikaz svih ticketa
 */
 function getTicket(req, res){
     let uid = req.params.uid;
    
     let object = {};
     if(uid) object['uid'] = uid;
     
    database.ticket.find(object).exec()
    .then(tickets=>{
        return res.status(200).json({ status: true, code: 200, tickets });
    }).catch(_=>{
        res.status(500).json({ status: false, code: 500 });
    });
 }

 /**
  * Prikaz svih poruka u ticketu
  */
function getMessages(req, res){
    let tid = req.params.tid;
    
    database.messages.find({ tid }).exec()
    .then(messages=>{
        return res.status(200).json({ status: true, code: 200, messages });
    }).catch(_=>{
        res.status(500).json({ status: false, code: 500 });
    });
}

export default { newTicket, newMessage, changeStatus, getTicket, getMessages };
