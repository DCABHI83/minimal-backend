import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

//addproduct
export const addproduct = async (req, res) => {
  try {
    let { name, price, categories, stock, description } = req.body;
    if (typeof categories === "string") {
      categories = [categories];
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one category is required" });
    }

    if (!name || price == null || stock == null || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "image is required" });
    }

    // console.log(req.file)
    const imageUrl = req.file.path;

    const product = await Product.findOne({ name });
    if (product) {
      return res.status(400).json({ message: "product already exists" });
    }

    let validCategories = [];
    let invalidCategories = [];
    let duplicateCategories = [];

    const normalizedCategories = categories.map((id) => id.toString().trim());
    const seen = new Set();
    for (let id of normalizedCategories) {
      if (seen.has(id)) {
        duplicateCategories.push(id);
        continue;
      }

      seen.add(id);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        invalidCategories.push(id);
        continue;
      }

      const exists = await Category.findById(id);
      if (!exists) {
        invalidCategories.push(id);
        continue;
      }

      validCategories.push(id);
    }
    if (
      validCategories.length === 0 ||
      invalidCategories.length > 0 ||
      duplicateCategories.length > 0
    ) {
      return res
        .status(400)
        .json({ message: "cant be added it is either invalid or duplicate" });
    }

    const newProduct = await Product.create({
      name,
      price,
      description,
      categories: validCategories,
      stock,
      image: imageUrl,
    });
    return res
      .status(201)
      .json({ message: "product created successfully", newProduct });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
}