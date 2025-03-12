const savedCategory = require("../models/savedCategoryModel");
const User = require("../models/userModel");
const Category = require("../models/categoriesModel");
const subCategory = require("../models/subCategoryModel");
const { validationResult } = require("express-validator");

exports.createSavedCategory = async (req, res) => {
  const { userId, categoryId } = req.body;
  const subCategoryId = req.body.subcategoryId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    const findCategoryByUserIdForUpdate =
      await savedCategory.findSavedCategoryByUserId(userId);
    if (findCategoryByUserIdForUpdate) {
      if (categoryId) {
        const findCategory = await Category.findCategoryById(categoryId);
        if (!findCategory) {
          return res.status(404).json({ errors: ["Category not found"] });
        }
      }
      if (subCategoryId) {
        const findSubCategory = await subCategory.findsubCategoryById(
          categoryId
        );
        if (findSubCategory.length === 0) {
          return res.status(404).json({ errors: ["SubCategory not found"] });
        }
        const findCorrcetSubCategory = findSubCategory.find(
          (sub) => sub.id.toString() === subCategoryId
        );
        if (!findCorrcetSubCategory) {
          return res.status(404).json({ errors: ["SubCategory not present"] });
        }
      }
      const updateSavedCategory =
        await savedCategory.updatesavedCategoryByUserId(userId, {
          categoryId: categoryId,
          subCategory: subCategoryId,
        });
      const findCategoryByUserId =
        await savedCategory.findSavedCategoryByUserId(userId);
      return res.status(200).json({
        message: "Saved category updated successfully",
        data: findCategoryByUserId,
      });
    }
    const findUser = await User.findUserById(userId);
    if (!findUser) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const findCategory = await Category.findCategoryById(categoryId);
    if (!findCategory) {
      return res.status(404).json({ errors: ["Category not found"] });
    }
    if(subCategoryId){
    const findSubCategory = await subCategory.findsubCategoryById(categoryId);
    if (findSubCategory.length === 0) {
      return res.status(404).json({ errors: ["SubCategory not found"] });
    }
    const findCorrcetSubCategory = findSubCategory.find(
      (sub) => sub.id.toString() === subCategoryId
    );
    if (!findCorrcetSubCategory) {
      return res.status(404).json({ errors: ["SubCategory not present"] });
    }
    }
    const savedCategoryData = await savedCategory.create({
      userId: userId,
      categoryId: categoryId,
      subCategory: subCategoryId,
    });
    return res.status(200).json({
      message: "Saved category created successfully",
      data: savedCategoryData,
    });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.findSavedCategory = async (req, res) => {
  const { userId } = req.body;
  try {
    let savedCategoryData;
    savedCategoryData = await savedCategory.findSavedCategoryByUserId(
      userId
    );
    if (!savedCategoryData) {
        return res
        .status(200)
        .json({ msg: "Saved category found", data: []});
    }
    return res
      .status(200)
      .json({ msg: "Saved category found", data: savedCategoryData });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};
