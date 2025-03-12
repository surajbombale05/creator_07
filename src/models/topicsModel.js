const pool = require("../../db");

class Topics {
  constructor({
    id,
    image_path,
    url,
    topic,
    description,
    date,
    clicks,
    views,
    categoryId,
    subCategoryId,
    teamId,
    status,
    approveDate,
    approveTime,
    viewedBy,
    type,
    bannerId,
  }) {
    this.id = id;
    this.image_path = image_path;
    this.topic = topic;
    this.url = url;
    this.description = description;
    this.date = date;
    this.clicks = clicks;
    this.views = views;
    this.categoryId = categoryId;
    this.subCategoryId = subCategoryId;
    this.teamId = teamId;
    this.status = status;
    this.approveDate = approveDate;
    this.approveTime = approveTime;
    this.viewedBy = viewedBy;
    this.type = type;
    this.bannerId = bannerId;
  }

  static async create({
    image_path,
    topic,
    url,
    description,
    date,
    categoryId,
    subCategoryId,
    teamId,
    type,
    bannerId,
  }) {
    let query;
    let values;

    if (!url || url === null || url === "") {
      query =
        "INSERT INTO topics (image_path, topic, url, description, date, categoryId, subCategoryId, teamId, type, bannerId) VALUES (?, ?, null, ?, ?, ?, ?, ?, ?, ?)";
      values = [
        image_path,
        topic,
        description,
        date,
        categoryId,
        subCategoryId || null,
        teamId,
        type,
        bannerId || null,
      ];
    } else {
      query =
        "INSERT INTO topics (image_path, topic, url, description, date, categoryId, subCategoryId, teamId, type, bannerId) VALUES (?, ?, ?, null, ?, ?, ?, ?, ?, ?)";
      values = [
        image_path,
        topic,
        url,
        date,
        categoryId,
        subCategoryId || null,
        teamId,
        type,
        bannerId || null,
      ];
    }
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Topic creation failed");
      }

      const newTopic = new Topics({
        id: result.insertId,
        image_path,
        url,
        topic,
        description,
        date,
        clicks: 0,
        views: 0,
        categoryId,
        subCategoryId,
        teamId,
        type,
        bannerId,
      });

      return newTopic;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findTopicsById(topicId) {
    const query = "SELECT * FROM topics WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [topicId]);
      return results.length ? new Topics(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findTopic(topicName) {
    const query = "SELECT * FROM topics WHERE topic = ?";

    try {
      const [results] = await pool.execute(query, [topicName]);
      return results.length ? new Topics(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllTopic(categoryId, subCategoryId) {
    let query;
    let values;
    if (categoryId !== null && subCategoryId === null) {
      query = "SELECT * FROM topics WHERE categoryId = ? AND status = '1'";
      values = [categoryId];
    }
    if (categoryId !== null && subCategoryId !== null) {
      query =
        "SELECT * FROM topics WHERE categoryId = ? AND subCategoryId = ? AND status = '1'";
      values = [categoryId, subCategoryId];
    }
    if (categoryId === null && subCategoryId === null) {
      query = "SELECT * FROM topics WHERE status = '1'";
    }
    try {
      const [results] = await pool.execute(query, values);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateTopic(topicId, {topic, description, image_path, categoryId, subCategoryId }) {
    const updateFields = [];
    const updateValues = [];


    if (topic !== undefined && topic.trim() !== '') {
      updateFields.push("topic = ?");
      updateValues.push(topic);
    }

    if (description !== undefined && description.trim() !== '') {
      updateFields.push("description = ?");
      updateValues.push(description);
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
        UPDATE topics
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;
    try {
      const params = [...updateValues, topicId];
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteTopic(topicId) {
    const query = "DELETE FROM topics WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [topicId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateTopicStatus(topicId, status, acceptDate, acceptTime) {
    const query =
      "UPDATE topics SET status = ?, approveDate = ?, approveTime = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [
        status,
        acceptDate,
        acceptTime,
        topicId,
      ]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllTopicWithLimit(categoryId, subCategoryId) {
    let query;
    let values;
    if (categoryId !== null && subCategoryId === null) {
      query =
        "SELECT * FROM topics WHERE categoryId = ? AND status = '1' ORDER BY views DESC LIMIT 5";
      values = [categoryId];
    }
    if (categoryId !== null && subCategoryId !== null) {
      query =
        "SELECT * FROM topics WHERE categoryId = ? AND subCategoryId = ? AND status = '1' ORDER BY views DESC LIMIT 5";
      values = [categoryId, subCategoryId];
    }
    if (categoryId === null && subCategoryId === null) {
      query =
        "SELECT * FROM topics WHERE status = '1' ORDER BY views DESC LIMIT 5";
    }
    try {
      const [results] = await pool.execute(query, values);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getAllTopicsAdmin(teamId) {
    const query = `
  SELECT topics.*, 
         admin.name AS teamMemberName,
         c.name as categoryName,
         s.name as subCategoryName,
         CASE
           WHEN topics.status = '0' THEN 'pending'
           WHEN topics.status = '1' THEN 'accepted'
           WHEN topics.status = '-1' THEN 'rejected'
           ELSE 'unknown' -- Add this if you want to handle any other status values
         END AS status
  FROM topics 
  INNER JOIN admin ON topics.teamId = admin.id
  LEFT JOIN categories AS c ON topics.categoryId = c.id
  LEFT JOIN subCategory AS s ON topics.subCategoryId = s.id
  WHERE topics.teamId = ?
  ORDER BY topics.created_at DESC
`;
    try {
      const [results] = await pool.execute(query, [teamId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateBannerData(topicId, bannerId) {
    const query = "UPDATE topics SET bannerId = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [bannerId, topicId || null]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllTopicMetaData() {
    const query = `
    SELECT
      COUNT(*) AS totalTopics,
      SUM(CASE WHEN status = '0' THEN 1 ELSE NULL END) AS pendingTopics,
      SUM(CASE WHEN status = '1' THEN 1 ELSE NULL END) AS acceptedTopics,
      SUM(CASE WHEN status = '-1' THEN 1 ELSE NULL END) AS rejectedTopics
    FROM topics
  `;
    try {
      const [result] = await pool.execute(query);
      const metaData = {
        totalTopics: parseInt(result[0].totalTopics, 10) || 0,
        pendingTopics: parseInt(result[0].pendingTopics, 10) || 0,
        acceptedTopics: parseInt(result[0].acceptedTopics, 10) || 0,
        rejectedTopics: parseInt(result[0].rejectedTopics, 10) || 0,
      };
      return metaData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async getAllTopicsOnlyAdmin() {
    const query = `
  SELECT topics.*, 
         admin.name AS teamMemberName,
         c.name as categoryName,
         s.name as subCategoryName,
         CASE
           WHEN topics.status = '0' THEN 'pending'
           WHEN topics.status = '1' THEN 'accepted'
           WHEN topics.status = '-1' THEN 'rejected'
           ELSE 'unknown' -- Add this if you want to handle any other status values
         END AS status
  FROM topics 
  INNER JOIN admin ON topics.teamId = admin.id
  LEFT JOIN categories AS c ON topics.categoryId = c.id
  LEFT JOIN subCategory AS s ON topics.subCategoryId = s.id
  ORDER BY topics.created_at DESC
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
    const query = "UPDATE topics SET  selectedTopics = ? WHERE id = ?";
    try {
      const [result] = await pool.execute(query, [status, trendingTopicId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Topics;
