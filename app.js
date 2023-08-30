const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

const workItems = [];


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://fajrdevil:test123@cluster0.8ckmckr.mongodb.net/todolistDB')
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);
const cooking = new Item({name: "Cooking"});
const reading = new Item({name: "Reading"});
const swimming = new Item({name: "Swimming"});
const defaultItems = [cooking, reading, swimming];
// await Item.insertMany(defaultItems);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})
const List = mongoose.model("List", listSchema)
  
async function getItem(){
    const items = await Item.find({});
    return items
}

async function getList(condition){
    const lists = await List.findOne(condition);
    return lists
}

async function deleteItem(id){
    await Item.deleteOne({_id: id});
}

app.get("/", function(req, res){
    getItem().then(function(foundItems){
        if (foundItems.length == 0){
            Item.insertMany(defaultItems);
            res.redirect("/")
        }else{
            res.render("list", {title: "Today", items: foundItems});
        }
    })
 
    
});

app.get("/:param", (req, res)=>{
    const listName = _.capitalize(req.params.param);
    getList({name: listName}).then(function(foundList){
        // console.log(foundList)
        if (!foundList){
            const list = new List({
                name: listName,
                items: defaultItems
            })
            list.save();
            res.redirect("/"+listName)
        }else{
            res.render("list", {title: foundList.name, items: foundList.items})
        }
    })
    
})

app.get("/about", (req, res)=>{
    res.render("about");
})

app.post("/", (req, res)=>{
    const listName = req.body.list;
    const itemName = req.body.newItem;
    const newItem = new Item({name: itemName});
    if (itemName != "" && listName == "Today"){
        newItem.save();
        res.redirect("/")
    }else if(itemName != ""){
        getList({name: listName}).then(function(foundList){
            foundList.items.push(newItem);
            foundList.save();
        })
        res.redirect("/"+listName)
    }
   
})

app.post("/delete", function(req, res){
    const deletedId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        deleteItem(deletedId);
        res.redirect("/")
    }else{
        async function doTheThing(){
           await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedId}}});
        }
        doTheThing();
        res.redirect("/" + listName);
    }

})


app.listen(3000, function(){
    console.log("server running on port 3000");
})