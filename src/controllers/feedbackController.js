const FeedBack = require("../models/feedbackModel");
const {formatTimeToIST} = require('../../utils/dateUtils')
const InAppNotification = require("../models/inAppNotificationModel");
const Request = require("../models/requestModel");
const {calculateStars} = require('../../utils/dateUtils')
const User = require("../models/userModel");

exports.createFeedback = async (req, res) => {
    const {workId, feedback, rating} = req.body;
    try{
        const findWork = await Request.findRequestById(workId);
        if(!findWork) {
            return res.status(404).json({ errors: ["Work not found"] });
        }
        const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
        const newFeedback = await FeedBack.create({
            user_id: findWork.creatorId,
            feedback_text: feedback,
            rating,
            date
        });
        const stars =  await calculateStars(findWork.creatorId);
        await User.updateCreatorStars(findWork.creatorId, stars);
        await InAppNotification.updateReviewInAppNotification(workId);
        return res.status(200).json({ message: "Feedback created successfully", data: newFeedback });
    }catch(error){
        console.error(error);
        return res.status(407).json({ errors: ["Something went wrong"] });
    }
}



exports.findAllReviewOfAUser = async (req, res) => {
    const {userId} = req.body;
    try{
        const findReview = await FeedBack.getAllReviewUserId(userId);
        return res.status(200).json({ message: "Review fetched successfully", data: findReview });
    }catch(error){
        console.error(error);
        return res.status(407).json({ errors: ["Something went wrong"] });
    }
} 