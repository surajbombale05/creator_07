const Service = require('../models/serviceModel');
const { validationResult } = require('express-validator');
const path = require('path');
const {formatTimeToIST} = require('../../utils/dateUtils');
const UserService = require('../models/userServiceModel');
const userService = require('../models/userServiceModel');
const moment = require('moment-timezone');

exports.createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  if (!req.file) {
    return res.status(400).json({ errors: ['Image file is required.'] });
  }

  const { title,price,serviceType } = req.body;

  const profileImagePath = req.file.path.replace(/\\/g, '/');
  const profileImageFilename = '/' + path.basename(profileImagePath);
  const date = formatTimeToIST().format('DD-MM-YYYY');
  try {
    const findName = await Service.findAllServiceTitlesLowerCase();
    if (findName.includes(title.toLowerCase())) {
      return res.status(400).json({ errors: ['Service with this title already exists'] });
    }    
    const newService = await Service.create({
      image_path: profileImageFilename,
      title,
      date,
      price,
      serviceType
    });

    return res.status(200).json({ message: 'Service Data', data: newService });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errors: ['Something went wrong'] });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAllServices();
    const formattedServices = services.map(service => ({
      ...service,
      price: `₹${service.price}${service.serviceType}`
    }));

    return res.status(200).json({ msg: 'List Of All Services', data: formattedServices });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errors: ['Something went wrong'] });
  }
};

exports.getServiceById = async (req, res) => {
  const serviceId = req.params.id;

  try {
    const service = await Service.findServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(service);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errors: ['Something went wrong'] });
  }
};

exports.updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const serviceId = req.params.id;
  const { title,price,status,serviceType } = req.body;
  let image_path;
  try {
    
    if (req.file) {
      let serviceImage = req.file.path.replace(/\\/g, "/");
      image_path = "/" + path.basename(serviceImage);
    }

    const updatedService = await Service.updateService(serviceId, {
      image_path,
      title,
      price,
      status,
      serviceType
    });

    const findUpdatedService = await Service.findServiceById(serviceId);
    return res.status(200).json({ message: 'Service updated successfully', data: findUpdatedService });
  } catch (error) {
    console.error('Error in updateService:', error);
    return res.status(400).json({ errors: ['Something went wrong'] });
  }
};

exports.deleteService = async (req, res) => {
  const serviceId = req.params.id;

  try {
    const success = await Service.deleteService(serviceId);

    if (!success) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in deleteService:', error);
    return res.status(400).json({ errors: ['Something went wrong'] });
  }
};


exports.getAllActiveServices = async (req, res) => {
  try {
    const services = await Service.getAllActiveServices();
    return res.status(200).json({ msg: 'List Of All Active Services', data: services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: ['Something went wrong'] });
  }
}



exports.getAllServiceData = async (req, res) => {
  const {serviceId} = req.body;
  try {
    const date = formatTimeToIST().format('YYYY-MM-DD');
    const services = await userService.findAllServiceCount(serviceId,date);
    return res.status(200).json({ msg: 'List Of All Service Data', data: services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: ['Something went wrong'] });
  }
};


exports.getAllUserServiceDetails = async (req, res) => {
  const {serviceId,type} = req.body;
  try {
    const date = formatTimeToIST().format('YYYY-MM-DD');
    const services = await userService.findAllServiceReports(serviceId,type,date);
    if(services.length === 0){
      return res.status(404).json({ errors: ['No Data Found'] });
    }
    return res.status(200).json({ msg: 'List Of All User Service Details', data: services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: ['Something went wrong'] });
  }
}
