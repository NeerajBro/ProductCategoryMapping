const express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Category = mongoose.model("Category");

router.use(function(req, res, next) {
  Category.find((err, docs) => {
    // console.log("Got data ", docs);
    if (!err) {
      //   console.log("data filling ", docs);
      req.getAllCategory = docs;
      next();
    } else {
      req.getAllCategory = [];
    }
  });
});

router.get("/", (req, res) => {
  Category.find((err, docs) => {
    // console.log("Got data ", docs);
    if (!err) {
      res.render("categorys/addOrEdit", {
        viewTitle: "Insert Cateogry",
        list: docs
      });
    } else {
      console.log("Error in retrieving Category list :" + err);
    }
  });
});

router.post("/", (req, res) => {
  console.log("Category post", req.body);

  if (req.body._id == "") insertRecord(req, res);
  else updateRecord(req, res);
});

function insertRecord(req, res) {
  var category = new Category();
  category.categoryName = req.body.categoryName;
  category.childCategoryIDs = req.body.childCategoryIDs;
  category.save((err, doc) => {
    if (!err) res.redirect("category/list");
    else {
      if (err.name == "ValidationError") {
        handleValidationError(err, req.body);
        res.render("categorys/addOrEdit", {
          viewTitle: "Insert Category",
          category: req.body
        });
      } else console.log("Error during record insertion : " + err);
    }
  });
}

function updateRecord(req, res) {
  Category.findOneAndUpdate(
    { _id: req.body._id },
    req.body,
    { new: true },
    (err, doc) => {
      if (!err) {
        res.redirect("category/list");
      } else {
        if (err.name == "ValidationError") {
          handleValidationError(err, req.body);
          res.render("categorys/addOrEdit", {
            viewTitle: "Update Category",
            category: req.body
          });
        } else console.log("Error during record update : " + err);
      }
    }
  );
}

router.get("/list", (req, res) => {
  Category.find((err, docs) => {
    if (!err) {
      docs.forEach((docElement, docIndex) => {
        var catName = [];
        docElement.childCategoryIDs.forEach(ids => {
          req.getAllCategory.forEach(element => {
            if (element._id == ids) {
              catName.push(element.categoryName);
            }
          });
        });
        docs[docIndex].childCategoryName = catName;
      });

      res.render("categorys/listcategories", {
        list: docs
      });
    } else {
      console.log("Error in retrieving Category list :" + err);
    }
  });
});

function handleValidationError(err, body) {
  for (field in err.errors) {
    switch (err.errors[field].path) {
      case "categoryName":
        body["categoryNameError"] = err.errors[field].message;
        break;
      default:
        break;
    }
  }
}

router.get("/:id", (req, res) => {
  Category.findById(req.params.id, (err, doc) => {
    if (!err) {
      res.render("categorys/addOrEdit", {
        viewTitle: "Update Category",
        category: doc,
        list: req.getAllCategory
      });
    }
  });
});

router.get("/delete/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.redirect("/category/list");
    } else {
      console.log("Error in Category delete :" + err);
    }
  });
});

module.exports = router;
