const path = require("path");
const User = require("../models/userModel");


exports.getUserDashboardByuserId = async (req, res) => {
  const userDashboardId = req.params.id;

  try {
    const banner = await User.findDashBoardById(userDashboardId);
    if (!banner) {
      return res.status(404).json({ error: "user Dashboard not found" });
    }
    return res.status(200).json({msg:"User Dashboard Data", data: banner});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


