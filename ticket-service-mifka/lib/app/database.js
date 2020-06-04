import mongoose from 'mongoose';

(async ()=>{
    try {        
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB Connected successfully!");
    } catch (error) {
        console.log("MongoDB cannot connect.");
        process.exit();
    }
})();

const
    ticket = mongoose.model("ticket", new mongoose.Schema({
        uid: { type: String, required: true }, // user id: ObjectID, korisnicko ime, email
        title: { type: String, default: null }, // naziv ticketa
        department: { type: String, default: null }, // Koji dio ticketa
        strange: { type: String, default: null }, // Koliko je ticket bitan 
        enable: { type: Boolean, default: true } // Na cekanju ili se odgovara
    }, {
        timestamps: true, // Enable created_at and updated_at
    })),
    messages = mongoose.model("message", new mongoose.Schema({
        tid: { type: mongoose.Types.ObjectId, ref: 'ticket', required: true }, // Ticket Id
        uid: { type: String, required: true }, // Koji korisnik salje ticket
        message: { type: String, required: true }, // Poruka korisnika
        attachments: { type: String, default: null }, //dodavanje attachmenta
    }, {
        timestamps: true
    }));

export default { ticket, messages }
