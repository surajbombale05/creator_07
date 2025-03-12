const categories = require("../models/categoriesModel");
const { validationResult } = require('express-validator');
const moment = require('moment-timezone');
const {formatTimeToIST} = require('../../utils/dateUtils')

exports.createCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
    }

    const {name} = req.body;
    try {
        const date = formatTimeToIST().format('DD-MM-YYYY'); 
        const findCollaborator = await categories.findByName(name);
        if (findCollaborator.length > 0) {
            return res.status(400).json({ errors: ['Category already exists'] });
        }
        const newCollaborator = await categories.createCategories({
            name,
            date
        });
        return res.status(200).json({ message: 'Category created successfully', data: newCollaborator });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};


exports.getAllCategory = async (req, res) => {
    try {
        const getcollaborator = await categories.getCategories()
        return res.status(200).json({ message: 'Category found', data: getcollaborator });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
}


exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const deleteCollaborator = await categories.deleteCategoryById(categoryId);
        if (!deleteCollaborator) {
            return res.status(404).json({ errors: ['Category not found'] });
        }
        return res.status(200).json({ message: 'Category deleted successfully', data: deleteCollaborator });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
}