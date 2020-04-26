const mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: "This field is required."
  },
  childCategoryIDs: []
});

mongoose.model("Category", categorySchema);
