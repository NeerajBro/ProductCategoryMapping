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
  if (req.body._id == "") insertRecord(req, res);
  else updateRecord(req, res);
});

router.post("/api/categoryAddUpdate", (req, res) => {
  if (req.body._id == "") insertRecord(req, res, 1);
  else updateRecord(req, res, 1);
});

function insertRecord(req, res, isapi = 0) {
  var category = new Category();
  category.categoryName = req.body.categoryName;
  category.childCategoryIDs = req.body.childCategoryIDs;
  category.save((err, doc) => {
    if (!err) {
      let successResponse = {
        code: 200,
        msg: "Category has been added successfully",
        status: "success"
      };
      if (isapi != 0) res.json(successResponse);
      else res.redirect("category/list");
    } else {
      let failResponse = {
        code: 400,
        msg: "",
        status: "fail"
      };
      if (err.name == "ValidationError") {
        handleValidationError(err, req.body);
        failResponse.msg = req.body;

        if (isapi != 0) res.json(failResponse);
        else {
          res.render("categorys/addOrEdit", {
            viewTitle: "Insert Category",
            category: req.body
          });
        }
      } else {
        failResponse.msg = err;
        if (isapi != 0) res.json(failResponse);
        else console.log("Error during record insertion : " + err);
      }
    }
  });
}

function updateRecord(req, res, isapi = 0) {
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

router.get("/api/list", (req, res) => {
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
        console.log("While ec", docs[docIndex].childCategoryName);
        // res.json(docs[docIndex].childCategoryName);
      });
      res.json(docs);
    } else {
      res.json({ code: 400, msg: err, status: "fail" });
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
