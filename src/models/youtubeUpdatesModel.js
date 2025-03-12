const pool = require("../../db");

class YoutubeUpdates {
  constructor({ id, image_path, url, title, description, date, teamId, views, viewedBy, bannerId, categoryId, subCategoryId, status, approveDate, approveTime, type }) {
    this.id = id;
    this.image_path = image_path;
    this.url = url;
    this.title = title;
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
  }


  static async create({ image_path, url, title, description, date, teamId, bannerId, categoryId, subCategoryId, type }) {
    let query;
    let values;

    query =
      "INSERT INTO youtubeupdates (image_path, url, title, description, date, teamId, bannerId, categoryId, subCategoryId, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    values = [image_path, url||null, title, description, date, teamId, bannerId||null, categoryId, subCategoryId, type];
    console.log(query, values)
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("YoutubeUpdates creation failed");
      }

      const newYoutubeUpdates = new YoutubeUpdates({
        id: result.insertId,
        image_path,
        url,
        title,
        description,
    });

      return newYoutubeUpdates;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findYoutubeUpdatesById(youtubeUpdateId) {
    const query = "SELECT * FROM youtubeupdates WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [youtubeUpdateId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllSocialUpdates(categoryId, subCategoryId) {
    let query;
    let values;
    if (categoryId !== null && subCategoryId === null) {
      query = "SELECT * FROM youtubeupdates WHERE categoryId = ? AND status = '1'";
      values = [categoryId];
    }
    if (categoryId !== null && subCategoryId !== null) {
      query =
        "SELECT * FROM youtubeupdates WHERE categoryId = ? AND subCategoryId = ? AND status = '1'";
      values = [categoryId, subCategoryId];
    }
    if (categoryId === null && subCategoryId === null) {
      query = "SELECT * FROM youtubeupdates WHERE status = '1'";
    }
    try {
      const [results] = await pool.execute(query, values);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  static async findAllYoutubeUpdates() {
    const query = `
    SELECT * 
    FROM youtubeupdates 
    WHERE status = '1' 
    ORDER BY 
      CASE 
        WHEN selectedTopics = 1 THEN 0  -- Topics with selectedTopic = 1 will appear first
        ELSE 1  -- Other topics will appear after selectedTopic = 1
      END,
      views DESC ;`;
  //   `LIMIT 4;
  // `;

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteYoutubeUpdates(youtubeUpdateId) {
    const query = "DELETE FROM youtubeupdates WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [youtubeUpdateId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateYoutubeUpdates(youtubeUpdateId, {
    title,
    description,
    image_path,
    categoryId,
    subCategoryId
}) {
    const updateFields = [];
    const updateValues = [];
    
    if(title !== undefined && title.trim() !== '') {
        updateFields.push("title = ?");
        updateValues.push(title);
    }

    if(description !== undefined && description.trim() !== '') {
        updateFields.push("description = ?");
        updateValues.push(description);
    }

    if (image_path !== undefined && image_path.trim() !== '') {
        updateFields.push("image_path = ?");
        updateValues.push(image_path);
    }

    if (updateFields.length === 0) {
        return false; 
    }

    if (categoryId !== undefined && categoryId.trim() !== '') {
      updateFields.push("categoryId = ?");
      updateValues.push(categoryId);
    }

    if (subCategoryId !== undefined && subCategoryId.trim() !== '') {
      updateFields.push("subCategoryId = ?");
      updateValues.push(subCategoryId);
    }

    const query = `
        UPDATE youtubeupdates
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;
    try {
        const params = [...updateValues, youtubeUpdateId];
        const [results] = await pool.execute(query, params);
        return results.affectedRows > 0 ? true : false;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


  static async updateYoutubeUpdateSttaus(youtubeUpdateId, status, acceptDate, acceptTime) {
    const query = "UPDATE youtubeupdates SET status = ?, approveDate = ?, approveTime = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [status, acceptDate, acceptTime, youtubeUpdateId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


  static async findAllYouTubeUpdatesByAdmin(teamId){
    const query = `SELECT youtubeupdates.*, 
        admin.name AS teamMemberName,
        c.name as categoryName,
        s.name as subCategoryName,
        CASE
           WHEN youtubeupdates.status = '0' THEN 'pending'
           WHEN youtubeupdates.status = '1' THEN 'accepted'
           WHEN youtubeupdates.status = '-1' THEN 'rejected'
           ELSE 'unknown' -- Add this if you want to handle any other status values
         END AS status
    FROM youtubeupdates 
    INNER JOIN admin ON youtubeupdates.teamId = admin.id
    LEFT JOIN categories AS c ON youtubeupdates.categoryId = c.id
	  LEFT JOIN subCategory AS s ON youtubeupdates.subCategoryId = s.id
    WHERE youtubeupdates.teamId = ?
    ORDER BY youtubeupdates.id DESC
 `;

    try {
      const [results] = await pool.execute(query, [teamId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async updateYoutubeUpdateBannerData(youtubeUpdateId,bannerId) {
    const query = "UPDATE youtubeupdates SET bannerId = ? WHERE id = ?";
    try{
      const [results] = await pool.execute(query, [bannerId, youtubeUpdateId]);
      return results.affectedRows > 0;
    }catch(error){
      console.error(error);
      throw error;
    }
}

static async findAllYoutubeUpdatesMetaData() {
  const query = `
    SELECT
      COUNT(*) AS totalYoutubeUpdates,
      SUM(CASE WHEN status = '0' THEN 1 ELSE 0 END) AS pendingYoutubeUpdates,
      SUM(CASE WHEN status = '1' THEN 1 ELSE 0 END) AS acceptedYoutubeUpdates,
      SUM(CASE WHEN status = '-1' THEN 1 ELSE 0 END) AS rejectedYoutubeUpdates
    FROM youtubeupdates
  `;
  try {
    const [result] = await pool.execute(query);
    const metaData = {
      totalYoutubeUpdates: parseInt(result[0].totalYoutubeUpdates, 10)||0,
      pendingYoutubeUpdates: parseInt(result[0].pendingYoutubeUpdates,10)||0,
      acceptedYoutubeUpdates: parseInt(result[0].acceptedYoutubeUpdates,10)||0,
      rejectedYoutubeUpdates: parseInt(result[0].rejectedYoutubeUpdates,10)||0
    };
    return metaData;
  } catch (error) {
    console.error(error);
    throw error;
  }

}


static async findAllYouTubeUpdatesOnlyAdmin(){
  const query = `SELECT youtubeupdates.*, 
      admin.name AS teamMemberName,
      c.name as categoryName,
      s.name as subCategoryName,
      CASE
         WHEN youtubeupdates.status = '0' THEN 'pending'
         WHEN youtubeupdates.status = '1' THEN 'accepted'
         WHEN youtubeupdates.status = '-1' THEN 'rejected'
         ELSE 'unknown' -- Add this if you want to handle any other status values
       END AS status
  FROM youtubeupdates 
  INNER JOIN admin ON youtubeupdates.teamId = admin.id
  LEFT JOIN categories AS c ON youtubeupdates.categoryId = c.id
  LEFT JOIN subCategory AS s ON youtubeupdates.subCategoryId = s.id
  ORDER BY youtubeupdates.id DESC
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
  const query = "UPDATE youtubeupdates SET  selectedTopics = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [status, trendingTopicId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
}
module.exports = YoutubeUpdates;
