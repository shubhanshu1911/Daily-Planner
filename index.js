import express from "express"
import bodyParser from "body-parser";
import { name } from "ejs";

const app = express();
const port = 3000;
let items = []; // store the items to be added
let currentDay = null;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get("/MyDash",function(req,res){
    
});

app.get("/today",function(req,res){
    const currentDate = new Date();
    const newDay = currentDate.getDay();

    // Check if it's a new day, and reset the items array if it is
    if (newDay !== currentDay) {
        items = [];
        currentDay = newDay;
    }
    var date = {
        currDate: new Date().toLocaleDateString(),
        currDay: new Date().getDay(),
        items: [],
        date: ["Monday","Tuesday","Wednesday","Thrusday","Friday","Saturday","Sunday"]
    };
    res.render("index.ejs",date);
});


app.post("/addItems",function (req,res){
    const newItem = req.body["fname"];
    items.push(newItem);
    console.log(items);
    var date = {
        currDate: new Date().toLocaleDateString(),
        currDay: new Date().getDay(),
        items: items  ,
        // items: [newItem],
        date: ["Monday","Tuesday","Wednesday","Thrusday","Friday","Saturday","Sunday"]
    };
    res.render("index.ejs",date);
});
app.listen(port,function(req,res){  
    console.log(`Listening at ${port}`)
});
