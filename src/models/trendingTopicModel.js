const pool = require("../../db");

class TrendingTopic {
  constructor({ id, image_path, url, title, description, date, teamId, views, viewedBy, bannerId, categoryId, subCategoryId, status, approveDate, approveTime, type, selectedTopics }) {
    this.id = id;
    this.image_path = image_path;
    this.title = title;
    this.url = url,
    this.description = description;
    this.date = date;
    this.teamId = teamId;
    this.views = views;
    this.viewedBy = viewedBy;
    this.bannerId = bannerId;
    this.categoryId = categoryId;
    this.subCategoryId = subCategoryId;
    this.status = status;
    this.approveDate = approveDate;
    this.approveTime = approveTime;
    this.type = type;
    this.selectedTopics = selectedTopics;
  }

  static async create({ image_path, title, url, description, date, teamId, bannerId, categoryId, subCategoryId, type }) {
    let query;
    let values;

    query = "INSERT INTO trendingtopics (image_path, title, url, description, date, teamId, bannerId, categoryId, subCategoryId, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    values = [image_path, title, url, description, date, teamId, bannerId||null, categoryId, subCategoryId, type];

    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("TrendingTopics creation failed");
      }

      const newTrendingTopics = new TrendingTopic({
        id: result.insertId,
        image_path,
        title,
        url,
        description,
        date,
        teamId,
    });

      return newTrendingTopics;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findTrendingTopicById(trendingTopicId) {
    const query = "SELECT * FROM trendingtopics WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [trendingTopicId]);
      return results.length ? results[0] : null;    
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllTrendingTopics() {
    const query = "SELECT * FROM trendingtopics WHERE status = '1' ORDER BY id DESC LIMIT 5";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteTrendingTopic(trendingTopicId) {
    const query = "DELETE FROM trendingtopics WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [trendingTopicId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateTrendingTopic(trendingTopicId, {
    title,
    description,
    image_path,
    categoryId,
    subCategoryId
}) {
    const updateFields = [];
    const updateValues = [];
    
    if(description !== undefined && description.trim() !== '') {
        updateFields.push("description = ?");
        updateValues.push(description);
    }
    
    if (title !== undefined && title.trim() !== '') {
        updateFields.push("title = ?");
        updateValues.push(title);
    }

    if (image_path !== undefined && image_path.trim() !== '') {
        updateFields.push("image_path = ?");
        updateValues.push(image_path);
    }

    if (categoryId !== undefined && categoryId.trim() !== '') {
      updateFields.push("categoryId = ?");
      updateValues.push(categoryId);
    }

    if (subCategoryId !== undefined && subCategoryId.trim() !== '') {
      updateFields.push("subCategoryId = ?");
      updateValues.push(subCategoryId);
    }

    if (updateFields.length === 0) {
        return false; // No fields to update
    }

    const query = `
        UPDATE trendingtopics
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;
    try {
        const params = [...updateValues, trendingTopicId];
        const [results] = await pool.execute(query, params);
        return results.affectedRows > 0 ? true : false;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async findAllTrendingTopicsWithLimit() {
  const query = `SELECT * 
  FROM trendingtopics 
  WHERE status = '1' 
  ORDER BY 
    CASE 
      WHEN selectedTopics = 1 THEN 0  -- Topics with selectedTopics = 1 will appear first
      ELSE 1  -- Other topics will appear after selectedTopics = 1, ordered by views
    END,
    views DESC 
  LIMIT 6;
  `;

  try {
    const [result] = await pool.execute(query);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateTrendingTopicStatus(trendingTopicId, status, acceptDate, acceptTime) {
  const query = "UPDATE trendingtopics SET status = ?, approveDate = ?, approveTime = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [status, acceptDate, acceptTime, trendingTopicId]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async findAllTrendingTopicsMetadata() {
  const query = `
    SELECT
      COUNT(*) AS totalTrendingTopics,
      SUM(CASE WHEN status = '0' THEN 1 ELSE NULL END) AS pendingTrendingTopics,
      SUM(CASE WHEN status = '1' THEN 1 ELSE NULL END) AS acceptedTrendingTopics,
      SUM(CASE WHEN status = '-1' THEN 1 ELSE NULL END) AS rejectedTrendingTopics
    FROM trendingtopics
  `;

  try {
    const [result] = await pool.execute(query);
    const metaData = {
      totalTrendingTopics: parseInt(result[0].totalTrendingTopics, 10) || 0,
      pendingTrendingTopics: parseInt(result[0].pendingTrendingTopics, 10) || 0,
      acceptedTrendingTopics: parseInt(result[0].acceptedTrendingTopics, 10) || 0,
      rejectedTrendingTopics: parseInt(result[0].rejectedTrendingTopics, 10) || 0,
    };

    return metaData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async updateBannerData(topicId, bannerId) {
  const query = "UPDATE trendingtopics SET bannerId = ? WHERE id = ?";
  try {
    const [results] = await pool.execute(query, [bannerId, topicId || null]);
    return results.affectedRows > 0;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async getAllTrendingTopicsAdmin(teamId) {
  const query = `
SELECT trendingtopics.*, 
       admin.name AS teamMemberName,
       c.name as categoryName,
       s.name as subCategoryName,
       CASE
         WHEN trendingtopics.status = '0' THEN 'pending'
         WHEN trendingtopics.status = '1' THEN 'accepted'
         WHEN trendingtopics.status = '-1' THEN 'rejected'
         ELSE 'unknown' -- Add this if you want to handle any other status values
       END AS status
FROM trendingtopics 
INNER JOIN admin ON trendingtopics.teamId = admin.id
LEFT JOIN categories AS c ON trendingtopics.categoryId = c.id
LEFT JOIN subCategory AS s ON trendingtopics.subCategoryId = s.id
WHERE trendingtopics.teamId = ?
ORDER BY trendingtopics.id DESC
`;
  try {
    const [results] = await pool.execute(query, [teamId]);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async getAllTrendingTopicsOnlyAdmin() {
  const query = `
SELECT trendingtopics.*, 
       admin.name AS teamMemberName,
       c.name as categoryName,
       s.name as subCategoryName,
       CASE
         WHEN trendingtopics.status = '0' THEN 'pending'
         WHEN trendingtopics.status = '1' THEN 'accepted'
         WHEN trendingtopics.status = '-1' THEN 'rejected'
         ELSE 'unknown' -- Add this if you want to handle any other status values
       END AS status
FROM trendingtopics 
INNER JOIN admin ON trendingtopics.teamId = admin.id
LEFT JOIN categories AS c ON trendingtopics.categoryId = c.id
LEFT JOIN subCategory AS s ON trendingtopics.subCategoryId = s.id
ORDER BY trendingtopics.id DESC
`;
  try {
    const [results] = await pool.execute(query);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

  static async updateSelectedTopicStatus(trendingTopicId, status) {
    const query = "UPDATE trendingtopics SET  selectedTopics = ? WHERE id = ?";
    try {
      const [result] = await pool.execute(query, [status, trendingTopicId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
module.exports = TrendingTopic;
