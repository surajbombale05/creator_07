const SavedTopic = require("../models/savedTopicModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const Topic = require("../models/topicsModel");

exports.createOrUpdateSavedTopic = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({ errors: errorMessages });
    }

    const { userId, topicIds } = req.body;
    const user = await User.findUserById(userId);

    if (!user) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    let uniqueSet = new Set(topicIds);
    const result = Array.from(uniqueSet);
    const invalidTopicIds = [];

    for (const topicId of result) {
        const topic = await Topic.findTopicsById(topicId);
        if (!topic) {
            invalidTopicIds.push(topicId);
        }
    }

    if (invalidTopicIds.length > 0) {
        return res
            .status(400)
            .json({ error: `Invalid topicIds: ${invalidTopicIds.join(", ")}` });
    }

    try {
        const existingSavedTopics = await SavedTopic.findSavedTopicByUserId(userId);

        if (existingSavedTopics.length > 0) {
            const existingTopicIds = JSON.parse(existingSavedTopics[0].topic_ids);
        const existingTopicIdsToUpdate = existingTopicIds.filter(id => !result.includes(id));
        const newTopicIds = result.filter(id => !existingTopicIds.includes(id));
        const updatedTopicIds = [...existingTopicIdsToUpdate, ...newTopicIds];
        await SavedTopic.updateSavedTopicByUserId(userId, { topicIds: updatedTopicIds });
        const updatedSavedTopic = await SavedTopic.findSavedTopicByUserId(userId);
        const combinedTopicIds = JSON.parse(updatedSavedTopic[0].topic_ids);

        return res.status(200).json({ msg: 'Topic updated successfully', data: { userId, topicIds: combinedTopicIds } });


        } else {
            const savedTopic = await SavedTopic.create({ userId, topicIds: result });
            return res
                .status(201)
                .json({ msg: "Topic saved successfully", data: savedTopic });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


  

exports.getSavedTopicsByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const savedTopics = await SavedTopic.findSavedTopicByUserId(userId);
    if (!savedTopics) {
      return res.status(404).json({ error: "SavedTopics not found" });
    }

    const topicsData = [];

    for (const savedTopic of savedTopics) {
      const topicIdsArray = JSON.parse(savedTopic.topic_ids);

      const topicPromises = topicIdsArray.map(async (topicId) => {
        const topicData = await Topic.findTopicsById(topicId);
        return {
          id: topicData.id,
          image_path: topicData.image_path,
          topic: topicData.topic,
          url: topicData.url,
          description: topicData.description,
        };
      });

      const savedTopicData = await Promise.all(topicPromises);
      topicsData.push(...savedTopicData);
    }

    return res.status(200).json({ topicsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
