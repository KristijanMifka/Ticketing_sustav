import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./app/router";

const app = express();

app.use(cors()); // 
app.use(bodyParser.json()); // 
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(`/api/${process.env.VERSION || 'v1'}`, router);

app.all('*', (req, res) => {
    res.status(404).json({ status: false, code: 404 });
});

app.listen(process.env.PORT, ()=>{
    console.log(`Service is running on port ${process.env.PORT}`);
});
