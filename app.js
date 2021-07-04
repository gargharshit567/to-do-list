//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const app = express();

app.set('view engine', 'ejs');

const day = date.getDate();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-harshit:Harshit@123@cluster0.0regq.mongodb.net/todolist",{useNewUrlParser:true,useUnifiedTopology: true});
const itemsSchema= {
  name: String
};
const Item= mongoose.model("Item",itemsSchema);
const item1= new Item({
  name:"Welcome to your to-do list"
});
const item2= new Item({
  name:"Click + to add items"
});
const item3= new Item({
  name:"<-- Click Here to remove items"
});
const defaultItems=[item1,item2,item3];

const listSchema= {
  name: String,
  items: [itemsSchema]
};
const List= mongoose.model("List",listSchema);

app.get("/", function(req, res) {



Item.find({},function(err,results){
  if(err){
    console.log(err);
  }
  else{
    if(results.length===0){

      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("success");
        }
      });
      res.redirect("/");
    }
    else{
    res.render("list", {listTitle: day, newListItems: results});

   }
  }
});


});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const title= req.body.list;
  const newItem=new Item({name: item});
  if(title===day){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:title},function(err,foundList){
      if(!err){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+title);
      }
    });
  }

});

app.post("/delete",function(req,res){
  const id=req.body.checkbox;
  const title= req.body.title;
  if(title===day){
      Item.deleteOne({_id:id},function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("deleted succefully");
          res.redirect("/");
        }
      });
  }
  else
  {

    List.findOneAndUpdate({name:title},{$pull:{items:{_id:id}}},function(err,foundList){
      if(!err){

        res.redirect("/"+title);
      }

    });
  }
});

app.get("/:title", function(req,res){
  const title=req.params.title;
  List.findOne({name:title},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      if(results==null){
       list= new List({
         name:title,
         items:defaultItems
        });

       list.save();
       res.redirect("/"+title);
     }
     else{
        res.render("list",{listTitle: title, newListItems: results.items});
     }

    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
