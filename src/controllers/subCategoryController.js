const subcategories = require("../models/subCategoryModel");
const { validationResult } = require('express-validator');
const moment = require('moment-timezone');
const {formatTimeToIST} = require('../../utils/dateUtils');
const category = require("../models/categoriesModel");

exports.createSubCategory = async (req, res) => {

    const {name,categoryId} = req.body;
    try {

        const findCategory = await category.findCategoryById(categoryId);
        if (!findCategory) {
            return res.status(404).json({ errors: ["Category not found"] });
        }
        const date = formatTimeToIST().format('DD-MM-YYYY hh:mm:ss A'); 
        const findCollaborator = await subcategories.findByName(name);
        if (findCollaborator.length > 0) {
            return res.status(400).json({ errors: ['SubCategory already exists'] });
        }
        const newCollaborator = await subcategories.createSubCategories({
            name,
            categoryid:categoryId,
            date
        });
        return res.status(200).json({ message: 'SubCategory created successfully', data: newCollaborator });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};


exports.getAllsubCategory = async (req, res) => {
    const {categoryId} = req.body;
    try {
        const getcollaborator = await subcategories.findsubCategoryById(categoryId);
        return res.status(200).json({ message: 'subCategory found', data: getcollaborator });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};


exports.deleteSubCategoryById = async (req, res) => {
    const subCategoryId  = req.params.id;
    try {
        const deleteCollaborator = await subcategories.deleteCategoryById(subCategoryId);
        if (!deleteCollaborator) {
            return res.status(404).json({ errors: ['SubCategory not found'] });
        }
        return res.status(200).json({ message: 'SubCategory deleted successfully', data: deleteCollaborator });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};