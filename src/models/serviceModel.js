const pool = require("../../db");

class Service {
  constructor({ id, image_path, title, date, price, status, serviceType }) {
    this.id = id;
    this.image_path = image_path;
    this.date = date;
    this.title = title;
    this.price = price;
    this.status = status;
    this.serviceType = serviceType;
  }

  static async create({ image_path, title, date, price, serviceType }) {
    const query = 'INSERT INTO services (image_path, title, date, price, serviceType) VALUES (?, ?, ?, ?, ?)';
    const values = [image_path, title, date, price, serviceType];
    console.log(values)
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error('Service creation failed');
      }

      const newService = new Service({
        id: result.insertId,
        image_path,
        title,
        date,
        price,
        serviceType
      });

      return newService;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findServiceById(serviceId) {
    const query = 'SELECT * FROM services WHERE id = ?';

    try {
      const [results] = await pool.execute(query, [serviceId]);
      return results.length ? new Service(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllServices() {
    const query = 'SELECT * FROM services';

    try {
      const [results] = await pool.execute(query);
      return results.map((result) => new Service(result));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteService(serviceId) {
    const query = 'DELETE FROM services WHERE id = ?';

    try {
      const [results] = await pool.execute(query, [serviceId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateService(serviceId, { image_path, title, price, status, serviceType }) {
    const updateFields = [];

    if (image_path !== undefined) {
      updateFields.push("image_path = ?");
    }
    if (title !== undefined) {
      updateFields.push("title = ?");
    }
    if(price !== undefined) {
      updateFields.push("price = ?");
    }
    if(status !== undefined) {
      updateFields.push("status = ?");
    }
    if(serviceType !== undefined) {
      updateFields.push("serviceType = ?");
    }
    if (updateFields.length === 0) {
      return false;
    }

    const query = `
      UPDATE services
      SET ${updateFields.join(", ")}
      WHERE id = ?;
    `;

    const params = [
      image_path,
      title,
      price,
      status,
      serviceType,
      serviceId,
    ].filter((value) => value !== undefined);
    try {
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
}

static async findServiceByTitle(title) {
  const query = 'SELECT * FROM services WHERE title = ?';
  try {
    const [results] = await pool.execute(query, [title]);
    return results.length ? new Service(results[0]) : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async findAllServiceTitlesLowerCase() {
  const query = 'SELECT LOWER(title) AS title FROM services';

  try {
    const [results] = await pool.execute(query);
    return results.map((result) => result.title);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

 static async getAllActiveServices() {
   const query = 'SELECT * FROM services WHERE status = 0';
   try {
     const [results] = await pool.execute(query);
     return results.map((result) => new Service(result));
   } catch (error) {
     console.error(error);
     throw error;
   }
 }
}


module.exports = Service;
