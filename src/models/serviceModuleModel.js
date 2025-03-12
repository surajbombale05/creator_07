const pool = require("../../db");

class ServiceModule {
  constructor({ id, service_id, type, image_path, description, video_link, date }) {
    this.id = id;
    this.service_id = service_id;
    this.type = type;
    this.image_path = image_path;
    this.description = description;
    this.video_link = video_link;
    this.date = date;
  }

  static async create({ service_id, type, image_path, description, video_link, date }) {
    const query =
      'INSERT INTO service_modules (service_id, type, image_path, description, video_link, date) VALUES (?, ?, ?, ?, ?, ?)';

    const values = [service_id, type, image_path, description, video_link, date];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error('ServiceModule creation failed');
      }

      const newServiceModule = new ServiceModule({
        id: result.insertId,
        service_id,
        type,
        image_path,
        description,
        video_link,
        date
      });

      return newServiceModule;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findServiceModuleById(moduleId) {
    const query = 'SELECT * FROM service_modules WHERE service_id = ?  ORDER BY id DESC LIMIT 50';

    try {
      const [results] = await pool.execute(query, [moduleId]);
      return results
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllServiceModules() {
    const query = `
        SELECT 
            sm.*, 
            s.title AS serviceType 
        FROM 
            service_modules sm 
        JOIN 
            services s 
        ON 
            sm.service_id = s.id 
        ORDER BY 
            sm.id DESC
    `;

    try{
      const [results] = await pool.execute(query);
      return results;
    }catch(error){
      console.error(error);
      throw error;
    }
}


static async updateServiceModule(serviceId,{image_path, description, video_link}) {
  const updateFields = [];
  const updateValues = [];

  if (image_path !== undefined && image_path.trim() !== '') {
    updateFields.push("image_path = ?");
    updateValues.push(image_path);
  }

  if (description !== undefined && description.trim() !== '') {
    updateFields.push("description = ?");
    updateValues.push(description);
  }

  if (video_link !== undefined && video_link.trim() !== '') {
    updateFields.push("video_link = ?");
    updateValues.push(video_link);
  }

  if (updateFields.length === 0) {
    return false; // No fields to update
  }

  const query = `
      UPDATE service_modules
      SET ${updateFields.join(", ")}
      WHERE id = ?
  `;

  const values = [...updateValues, serviceId];
  try {
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }

}


static async findServiceModuleByid(moduleId) {
  const query = 'SELECT * FROM service_modules WHERE id = ?';
  try {
    const [results] = await pool.execute(query, [moduleId]);
    return results.length ? results[0] : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async deleteServiceModule(moduleId) {
  const query = 'DELETE FROM service_modules WHERE id = ?';
  try {
    const [result] = await pool.execute(query, [moduleId]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

}

module.exports = ServiceModule;
