import Category from "../models/categoryModel.js";



const categoryControl =async (req, res) => {
  try {
    console.log(req.body)
    const { categoryname, description } = req.body;

    const category = await Category.findOne({ categoryname });
    // console.log(category);
    console.log(categoryname,description)
    if (category) {
      return res.status(409).json({ message: "category already exist" });
    }

    if (!categoryname || !description) {
      return res.status(400).json({ message: "All fieds are required" });
    }

    const categories = await Category.create({ categoryname, description });
    console.log(categories);
    return res
      .status(201)
      .json({ message: "category created successfully", categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default categoryControl