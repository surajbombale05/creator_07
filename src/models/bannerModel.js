const pool = require("../../db");

class Banner {
  constructor({ id, image_path }) {
    this.id = id;
    this.image_path = image_path;
    this.url = this.url,
    this.title = this.title,
    this.description = this.description,
    this.date = this.date;
  }

  static async create({ image_path, url, title, description, date }) {
    let query;
    let values;

    if ( !url || url === null || url === '') {
      query =
        "INSERT INTO banners (image_path, url, title, description, date) VALUES (?, null, ?, ?, ?)";
      values = [image_path, title, description,date];
    } else {
      query =
        "INSERT INTO banners (image_path, url, title, description, date) VALUES (?, ?, null, null, ?)";
      values = [image_path, url, date];

    }

    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Banner creation failed");
      }

      const newBanner = new Banner({
        id: result.insertId,
        image_path,
      });

      return newBanner;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findBannerById(bannerId) {
    const query = "SELECT * FROM banners WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [bannerId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllBanners() {
    const query = "SELECT * FROM banners";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteBanner(bannerId) {
    const query = "DELETE FROM banners WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [bannerId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateBanner(bannerId, {
    url,
    title,
    description,
    image_path
}) {
    const updateFields = [];
    const updateValues = [];
    
    if (url !== undefined && url !== null && url !== '') {
        updateFields.push("url = ?");
        updateValues.push(url);

        if (title !== undefined) {
            updateFields.push("title = ?");
            updateValues.push(null);
        }
        if (description !== undefined) {
            updateFields.push("description = ?");
            updateValues.push(null);
        }
    } else {
        if (title !== undefined) {
            updateFields.push("title = ?");
            updateValues.push(title);
        }
        if (description !== undefined) {
            updateFields.push("description = ?");
            updateValues.push(description);
        }
        if (url !== undefined) {
          updateFields.push("url = ?");
          updateValues.push(null);
      }
    }
    if (image_path !== undefined) {
        updateFields.push("image_path = ?");
        updateValues.push(image_path);
    }

    if (updateFields.length === 0) {
        return false; // No fields to update
    }

    const query = `
        UPDATE banners
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;
    try {
        const params = [...updateValues, bannerId];
        const [results] = await pool.execute(query, params);
        return results.affectedRows > 0 ? true : false;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async findAllBannersWithLimit() {
  const query = "SELECT * FROM banners LIMIT 3";

  try {
    const [result] = await pool.execute(query);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

}

module.exports = Banner;
