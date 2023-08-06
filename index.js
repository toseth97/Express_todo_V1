const express = require("express");
const bodyParser = require("body-parser");
const { itemSchema } = require("./item");
const mongoose = require("mongoose");
const _ = require("lodash")

connectDB();
async function connectDB() {
    await mongoose
        .connect("mongodb://127.0.0.1:27017/todo")
        .then(console.log("DB connected"))
        .catch((err) => console.log(err.message));
}
const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const Item = mongoose.model("item", itemSchema);
const listSchema = new mongoose.Schema({
    name: String,
    items:[itemSchema]
})

const listItem = mongoose.model("listItem", listSchema)

app.get("/", function (req, res) {
    get();
    async function get() {
        const today = new Date();
        const option = {
            weekday: "long",
            day: "numeric",
            month: "long",
        };
        const day = today.toLocaleDateString("en-US", option);

        const dbItems = await Item.find();
        //console.log(dbItems);

        res.render("live", {
            title: day,
            items: dbItems,
            route: "/",
        });
    }
});

app.post("/", function (req, res) {
    const newItem = req.body.newItem;
    const dbItem = Item.create({
        name: newItem,
    });
    res.redirect("/");
});

app.get("/:list", function (req, res) {
    const listName = _.capitalize(req.params.list)
    
    //create a a collection for new params

    get();
    async function get() {
        
        if(await listItem.findOne({name:listName})){
            const dbItem = await listItem.findOne({name:listName})
            res.render("live", {
                title:listName,
                items:dbItem.items,
                route:"/"+listName
            })
        }
        else
        {
            const item = new listItem({name:listName})
            item.save()
            res.redirect("/"+listName)
        }
    }

    
});


app.post("/:list", function (req, res) {
    if (req.params.list !== "delete"){
        post()
        async function post(){
            const listName = _.capitalize(req.params.list);
            const formItem = req.body.newItem;
            const dbItem = await listItem.findOne({name:listName})
            console.log(dbItem)
            const item = new Item({name:formItem})
            dbItem.items.push(item)
            dbItem.save()
            res.redirect("/"+listName)
        }
    }else if (req.params.list == "delete"){
        const checkbox = req.body.checkbox
        const route = req.body.name
        deleteItem()
        async function deleteItem(){
            if (route == "/"){
                const item = await Item.findByIdAndDelete({_id:checkbox})
                res.redirect(route)
            }
            else{
                const getCollection = await listItem.updateOne({name: (route.slice(1))}, { $pull:{ items: {_id:checkbox}}})
                res.redirect(route)
            }
                
            }
        }
    }
);


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on port 3000");
});
