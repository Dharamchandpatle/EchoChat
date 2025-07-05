import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const recipientId = req.params.id;

        // Validate recipientId
        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }

        const recipient = await User.findById(recipientId);
        // Check if the recipient exists
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        // Check if the recipient is already a friend
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user." });
        }

        // Check if a friend request already exists
        const existingRequest = await FriendRequest.findOne({
          $or: [
            { sender: myId, recipient: recipientId },
            { sender: recipientId, recipient: myId }
          ]
        });

        // If a friend request already exists, return an error
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already exists." });
        }
       
        // Create a new friend request
        const newRequest = new FriendRequest({
            sender: myId,
            recipient: recipientId,
        });

        // Save the friend request to the database
        await newRequest.save();
        res.status(200).json({ FriendRequest ,message: "Friend request sent successfully." });


    } catch (error) {
        console.error("Error in sendFriendRequests controller", error.message);
        res.status(500).json({ message: "Friend req internal Server Error" });
        
    }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function getFriendRequests(req, res){
    try {
        // Fetch all incoming friend requests for the current user
        // Populate the sender field with user's fullName, profilePic, nativeLanguage, and learningLanguage
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status : "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        // Fetch all accepted friend requests for the current user
        const acceptedReqs = await FriendRequest.find({
            recipient: req.user.id,
            status : "accepted",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        
        console.error("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" }); 
    }
}


export async function getOutgoingFriendReqs(req, res) {
    try {
        // Fetch all outgoing friend requests sent by the current user
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        
        console.error("Error in getOutgoingFriendReqs controller", error.message);  
        res.status(500).json({ message: "Internal Server Error" });
    }
}