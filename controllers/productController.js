const express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Product = mongoose.model("Product");
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
  console.log("All Category ", req.getAllCategory);
  res.render("products/addOrEdit", {
    viewTitle: "Insert Product",
    categoryList: req.getAllCategory
  });
});

router.post("/", (req, res) => {
  if (req.body._id == "") insertRecord(req, res);
  else updateRecord(req, res);
});

router.post("/api/productAddEdit", (req, res) => {
  if (req.body._id == "") insertRecord(req, res, 1);
  else updateRecord(req, res, 1);
});

router.post("/api/getProductByCat", (req, res) => {
  console.log("Requ ", req.body.categoryIDs);
  if (req.body.categoryIDs == "" || req.body.categoryIDs === undefined) {
    res.json({ code: 400, msg: "Category ids are required", status: "fail" });
  } else {
    reqCategoryIDS = req.body.categoryIDs;
    Product.find({ categoryIDs: { $in: reqCategoryIDS } }, (err, doc) => {
      if (!err) {
        res.json(doc);
      }
    });
  }
});

function insertRecord(req, res, isapi = 0) {
  var product = new Product();
  product.productName = req.body.productName;
  product.productDes = req.body.productDes;
  product.price = req.body.price;
  product.sku = req.body.sku;
  product.categoryIDs = req.body.categoryIDs;
  product.save((err, doc) => {
    if (!err) {
      let successResponse = {
        code: 200,
        msg: "Product has been added successfully",
        status: "success"
      };
      if (isapi != 0) res.json(successResponse);
      else res.redirect("product/list");
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
          res.render("products/addOrEdit", {
            viewTitle: "Insert Product",
            product: req.body
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
  Product.findOneAndUpdate(
    { _id: req.body._id },
    req.body,
    { new: true },
    (err, doc) => {
      if (!err) {
        let successResponse = {
          code: 200,
          msg: "Product has been updated successfully",
          status: "success"
        };
        if (isapi != 0) res.json(successResponse);
        else res.redirect("product/list");
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
            res.render("products/addOrEdit", {
              viewTitle: "Update Product",
              product: req.body
            });
          }
        } else {
          failResponse.msg = err;
          if (isapi != 0) res.json(failResponse);
          else console.log("Error during record update : " + err);
        }
      }
    }
  );
}

router.get("/list", (req, res) => {
  Product.find((err, docs) => {
    if (!err) {
      docs.forEach((docElement, docIndex) => {
        var catName = [];
        docElement.categoryIDs.forEach(ids => {
          req.getAllCategory.forEach(element => {
            if (element._id == ids) {
              catName.push(element.categoryName);
            }
          });
        });
        docs[docIndex].categoryName = catName;
      });

      res.render("products/listProduct", {
        list: docs,
        categoryList: req.getAllCategory
      });
    } else {
      console.log("Error in retrieving product list :" + err);
    }
  });
});

function handleValidationError(err, body) {
  for (field in err.errors) {
    switch (err.errors[field].path) {
      case "productName":
        body["productNameError"] = err.errors[field].message;
        break;
      default:
        break;
    }
  }
}

router.get("/:id", (req, res) => {
  Product.findById(req.params.id, (err, doc) => {
    if (!err) {
      res.render("products/addOrEdit", {
        viewTitle: "Update Product",
        product: doc,
        categoryList: req.getAllCategory
      });
    }
  });
});

router.get("/delete/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.redirect("/product/list");
    } else {
      console.log("Error in product delete :" + err);
    }
  });
});

module.exports = router;
