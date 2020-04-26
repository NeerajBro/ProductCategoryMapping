require("./models/db");

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");
const cors = require("cors");

const productController = require("./controllers/productController");
const categoryController = require("./controllers/categoryController");

var app = express();
app.use(cors());
app.use(
  bodyparser.urlencoded({
    extended: true
  })
);
app.use(bodyparser.json());
app.set("views", path.join(__dirname, "/views/"));
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    defaultLayout: "mainLayout",
    layoutsDir: __dirname + "/views/layouts/"
  })
);
app.set("view engine", "hbs");

app.listen(3000, () => {
  console.log("Server running on port : 3000");
});
app.get("/", (req, res) => {
  // console.log("Got data ", docs);

  res.render("home", {
    viewTitle: "Home"
  });
});

app.use("/product", productController);
app.use("/category", categoryController);
