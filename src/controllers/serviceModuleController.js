const ServiceModule = require('../models/serviceModuleModel'); 
const { validationResult } = require('express-validator');
const path = require('path');
const {formatTimeToIST} = require('../../utils/dateUtils')

exports.createServiceModule = async (req, res) => {
    let profileImageFilename;
    let { service_id, type, description, video_link } = req.body;

    try {
      switch (service_id.toString()) { 
        case '1':
          if (type !== 'image' || !req.file || !description) {
            throw new Error('Invalid data for service id 1.');
          }
          const profileImagePath = req.file.path.replace(/\\/g, '/');
          profileImageFilename = '/' + path.basename(profileImagePath);
          video_link = null;

          break;

        case '2':
          if (type !== 'video' || !video_link) {
            throw new Error('Invalid data for service id 2.');
          }
          profileImageFilename = null;
          description = null;
          break;

        case '3':
          if (type !== 'image' || !req.file) {
            throw new Error('Invalid data for service id 3.');
          }
          const imagePath = req.file.path.replace(/\\/g, '/');
          profileImageFilename = '/' + path.basename(imagePath);
          video_link = null;
          description = null;
          break;

        default:
          throw new Error(`Unsupported service_id: ${service_id}`);
      }

      const date = formatTimeToIST().format('DD-MM-YYYY');

      const newServiceModule = await ServiceModule.create({
        service_id: parseInt(service_id),
        type,
        image_path: profileImageFilename,
        description,
        video_link,
        date
      });

      return res.status(200).json({ message: 'ServiceModule Data', data: newServiceModule });
    } catch (error) {
      console.error(error.message);
      return res.status(407).json({ errors: [error.message] });
    }
};


exports.getServiceModuleById = async (req, res) => {
  const serviceId = req.params.id;
  try {
    let result,data
    const serviceModules = await ServiceModule.findServiceModuleById(serviceId);
    if(serviceId==1){
      result = 'content'
      data = 'created'
    }else if(serviceId==2){
      result = 'videos'
      data = 'edited'
    }else if(serviceId==3){
      result = 'thumbnails'
      data = 'edited'
    }
    if (serviceModules.length === 0) {
      return res.status(200).json({
        message: 'List of service',
        topic: `These ${result} are ${data} by us`,
        data: [],
      });
    }

    let responseData = [];
    serviceModules.forEach(module => {
      let topic = '';
      let data = {
        id: module.id,
      };

      switch (module.service_id) {
        case 1:
          topic = 'These content are created by us';
          data.image_path = module.image_path;
          data.description = module.description;
          data.video_link = module.video_link;
          break;

        case 2:
          topic = 'These videos are edited by us';
          data.video_link = module.video_link;
          data.description = module.description;
          data.image_path = module.image_path;
          break;

        case 3:
          topic = 'These thumbnails are edited by us';
          data.image_path = module.image_path;
          data.description = module.description;
          data.video_link = module.video_link;
          break;

        default:
          return res.status(400).json({ errors: ['Unsupported service_id'] });
      }

      const existingTopicIndex = responseData.findIndex(entry => entry.topic === topic);

      if (existingTopicIndex !== -1) {
        responseData[existingTopicIndex].data.push(data);
      } else {
        responseData.push({
          message: 'List of service',
          topic,
          data: [data],
        });
      }
    });


    return res.status(200).json(responseData[0]);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};



exports.getAllServiceModule = async (req, res) => {
  try {
    const serviceModules = await ServiceModule.findAllServiceModules();
    return res.status(200).json({ message: 'List Of All ServiceModule', data: serviceModules });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};


exports.updateServiceModule = async (req, res) => {
  const serviceId = req.params.id;
  const {description, video_link,type } = req.body;
  try {
    let profileImageFilename;
    const findServiceById = await ServiceModule.findServiceModuleByid(serviceId);
    if (!findServiceById) {
      return res.status(404).json({ errors: ['ServiceModule not found'] });
    }
    if(type === 'content writing'){
      if(req.file){
        const imagePath = req.file.path.replace(/\\/g, '/');
        profileImageFilename = '/' + path.basename(imagePath);
      }
      await ServiceModule.updateServiceModule(serviceId, {
        description,
        image_path: profileImageFilename
      })
    }
    if(type === 'video editing'){
      await ServiceModule.updateServiceModule(serviceId, {
        video_link
      })
    }
    if(type === 'thumbnail editing'){
      if(req.file){
        const imagePath = req.file.path.replace(/\\/g, '/');
        profileImageFilename = '/' + path.basename(imagePath);
      }
      await ServiceModule.updateServiceModule(serviceId, {
        image_path: profileImageFilename
      })
    }
    const findServiceModuleById = await ServiceModule.findServiceModuleByid(serviceId);
    return res.status(200).json({ message: 'ServiceModule updated successfully', data: findServiceModuleById });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.deleteServiceModule = async (req, res) => {
  const serviceId = req.params.id;
  try {
    const findServiceById = await ServiceModule.deleteServiceModule(serviceId);
    if (!findServiceById) {
      return res.status(404).json({ errors: ['ServiceModule not found'] });
    }
    return res.status(200).json({ message: 'ServiceModule deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getAllServiceModuleById = async (req, res) => {
  const {serviceModuleId} = req.body;
  try{
    const serviceModule = await ServiceModule.findServiceModuleByid(serviceModuleId);
    if(!serviceModule){
      return res.status(404).json({ errors: ['ServiceModule not found'] });
    }
    return res.status(200).json({ message: 'ServiceModule Data', data: serviceModule });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}

