const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.registerUser = async (req, res) => {
  const { username, password, gender, DOB } = req.body;
  console.log(username, password);

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      password,
      gender,
      DOB,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId)
      .select("-password")
      .populate("friends", "username")
      .populate("friendRequests", "username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transformedUser = {
      ...user.toObject(),
      friends: user.friends.map((friend) => friend.username),
      friendRequests: user.friendRequests.map((request) => request.username),
    };

    res.json(transformedUser);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, gender, DOB } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, gender, DOB },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const latestUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-password");

    res.status(200).json(latestUsers);
  } catch (error) {
    console.error("Error fetching latest users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.body;
    const users = await User.find(
      { username: { $regex: query, $options: "i" } },
      "username"
    ).limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const username = String(req.params.username);
    
    const user = await User.find({username:username}).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    if (user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    friend.friendRequests.push(userId);
    await friend.save();
    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.handleFriendRequest = async (req, res) => {
  try {
    const { userId, requesterId, accept } = req.body;
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User or requester not found" });
    }
    const requestIndex = user.friendRequests.indexOf(requesterId);
    if (requestIndex === -1) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    user.friendRequests.splice(requestIndex, 1);

    if (accept) {
      if (!user.friends.includes(requesterId)) {
        user.friends.push(requesterId);
      }
      if (!requester.friends.includes(userId)) {
        requester.friends.push(userId);
      }
    }

    await user.save();
    await requester.save();

    res.status(200).json({
      message: accept ? "Friend request accepted" : "Friend request rejected",
      updatedUser: {
        _id: user._id,
        username: user.username,
        gender: user.gender,
        DOB: user.DOB,
        friends: user.friends,
        friendRequests: user.friendRequests,
      },
    });
  } catch (error) {
    console.error("Error handling friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.logoutUser = async(req,res)=>{
  try {
    res.send({message:"logged out"})
  }
  catch (error) {
    console.error("Error handling logout:", error);
    res.status(500).json({ message: "Server error" });
    }
}