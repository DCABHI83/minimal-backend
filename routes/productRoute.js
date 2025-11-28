import express, { json } from "express";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import mongoose, { mongo } from "mongoose";
import { verifytoken } from "../middleware/authMiddleware.js";
import uploadcloud from "../config/multerCloudinaryConfig.js";
import categoryControl from "../controllers/categoryControllers.js";
import { addproduct } from "../controllers/productcontroller.js";

const productRouter = express.Router();

//Category
productRouter.post("/categories",categoryControl )

//createProduct
productRouter.post("/addproduct",uploadcloud.single('image'),addproduct);

//getallProducts

productRouter.get("/getallproducts", async (req, res) => {
  try {
    const { name, category } = req.query;

    const filter = {};

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      filter.categories = category;
    }

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const product = await Product.find(filter).populate("categories");

    return res
      .status(200)
      .json({ message: "Product fetched successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
});

//getsingleProduct

productRouter.get("/getsingleproduct/:id", async (req, res) => {
  try {
    const { name, id } = req.params;
    console.log(id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).populate("categories");
    console.log(product);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res
      .status(200)
      .json({ message: "product fetched successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
});

//updatePtoduct

productRouter.put("/updateproduct/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const { name, price, stock, description, categories } = req.body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate categories (if provided)
    if (categories) {
      if (!Array.isArray(categories)) {
        return res.status(400).json({ message: "Categories must be an array" });
      }

      const found = await Category.find({ _id: { $in: categories } });
      if (found.length !== categories.length) {
        return res
          .status(400)
          .json({ message: "Some category IDs do not exist" });
      }

      product.categories = categories; // Assign valid categories
    }

    // Update only provided fields
    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (description) product.description = description;

    // Save updates
    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

productRouter.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid id" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: "product is deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
});

export default productRouter;
