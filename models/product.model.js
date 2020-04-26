const mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: "This field is required."
  },
  productDes: {
    type: String
  },
  price: {
    type: String
  },
  sku: {
    type: String
  },
  categoryIDs: []
});

mongoose.model("Product", productSchema);
