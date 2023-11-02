import express from "express"
import bodyParser from "body-parser";
import { name } from "ejs";
import axios from "axios";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;
// let items = []; // store the items to be added
let currentDay = null;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// TODO : connecting to mongoDB atlas 
    // Connect to MongoDB Atlas with the appropriate database name
    mongoose.connect("mongodb+srv://ishankhare30:ZxDBOR3dHkLW4HZD@cluster0.qrtggc1.mongodb.net/Todo_items", {
    useNewUrlParser: true,
    useUnifiedTopology: true
    });

// TODO : Create the schema
    const itemsSchema = {
        itemName: String
    };
    // Create the model/table (name should be capitalized)
    const Item = mongoose.model("Item", itemsSchema);

    const item1 = new Item({
        itemName : "Welcome to list"
    });

// TODO : Creating a new custom list schema
    const customListSchema = {
        listName : String,
        items : [itemsSchema]
    }
    // Create the model/table (name should be capitalized)
    const List = mongoose.model("list",customListSchema);

// TODO : Create the Entered list schema
    const enteredListSchema = {
        enteredListName: String
    };
    // Create the model/table (name should be capitalized)
    const EnteredList = mongoose.model("enteredList", enteredListSchema);

// TODO : Today/Home get route 
    app.get("/",function(req,res){
        // find FUnction will return all the values of the array(items)  
        Item.find({})
        .then(foundItems => {
            
            var data = {
                listTitle : "Today",
                currDate: new Date().toLocaleDateString(),
                currDay: new Date().getDay(),
                items: foundItems,
                day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            };
            res.render("index.ejs",data);
            // res.render("index.ejs",{listTitle : "Today", items : foundItems});
        })
        .catch(err => {
            console.error(err);
            // Handle the error, e.g., send an error response
            return res.status(500).send("Error fetching items");
        });
    });

// TODO : Custom get route
// Update the GET route for the custom list page
app.get("/:customList", async (req, res) => {
    const customListName = _.capitalize(req.params.customList);

    try {
        // Fetch all custom lists from the database
        const customLists = await List.find({}, 'listName');

        // Check if the custom list exists in the database
        const foundList = await List.findOne({ listName: customListName });

        if (!foundList) {
            // Create a new list
            const list = new List({
                listName: customListName,
                items: []
            });
            list.save();
            // Render the custom list page with the custom list name and all custom lists
            res.render("list.ejs", { listTitle: customListName, items: [], customListName, customLists });
        } else {
            // Show the existing list
            console.log(foundList.listName);
            // Render the custom list page with the custom list name and all custom lists
            res.render("list.ejs", { listTitle: foundList.listName, items: foundList.items, customListName, customLists });
        }
    } catch (err) {
        console.error(err);
        // Handle the error, e.g., send an error response
        return res.status(500).send("Error fetching items");
    }
});



// Create a custom list route
app.post("/createCustomList", (req, res) => {
    const customListName = req.body.customListName;

    const newEnteredList = new EnteredList({
        enteredListName : customListName
    });
    newEnteredList.save();


    // Redirect to the custom list page for the newly created list
    res.redirect(`/${customListName}`);
});


// TODO  : addItems post route 
    app.post("/",function (req,res){
        const newItem = req.body.newTask;
        const customListName = req.body.list;

        const item = new Item({
            itemName : newItem
        });

        if(customListName === "Today"){
            item.save(); 
            res.redirect("/");
        }
        else {
            List.findOne({listName : customListName})
            .then(foundList => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + customListName);
            })
            .catch(err => {
                console.error(err);
                // Handle the error, e.g., send an error response
                return res.status(500).send("Error fetching items");
            });
        }
    });

// TODO : delete post route 
    app.post("/delItems",(req,res) => {
        const checkedItemID = req.body.task;
        const customListName = req.body.list;

        if(customListName === "Today") {
            Item.findByIdAndRemove(checkedItemID)
            .then(() => {
                console.log("Successfully deleted checked item");
                res.redirect("/");
            })
            .catch(err => {
                console.error("Error deleting checked item: " + err);
            });
        }
        else {
            List.findOneAndUpdate({listName : customListName},{$pull : {items : {_id : checkedItemID}}})
            .then(updatedList => {
                if (updatedList) {
                    res.redirect("/" + customListName);
                } else {
                    // Handle the case when the list is not found
                    res.status(404).send("Custom list not found.");
                }
            })
            .catch(err => {
                console.error(err);
                // Handle the error, e.g., send an error response
                res.status(500).send("Error removing item from custom list.");
            });
        }
    });



app.listen(port,function(req,res){  
    console.log(`Listening at ${port}`)
});
