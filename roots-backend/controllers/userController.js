import bcrypt from 'bcrypt';

import User from '../models/User.js';

// ✅ Get current user (auth protected)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update own profile (username/email/password)
export const updateUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete own account
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user);
    res.clearCookie("token");
    res.status(200).json({ message: "Account deleted and logged out" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update public profile by username (bio, links, image, theme)
export const updateUserByUsername = async (req, res) => {
  const { username } = req.params;
  const { bio, links, profileImage, theme } = req.body;

  try {
    const currentUser = await User.findById(req.user);
    if (!currentUser || currentUser.username !== username) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this profile" });
    }

    if (bio !== undefined) currentUser.bio = bio;
    if (profileImage !== undefined) currentUser.profileImage = profileImage;
    if (Array.isArray(links)) currentUser.links = links;
    if (theme !== undefined) currentUser.theme = theme;

    await currentUser.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        username: currentUser.username,
        bio: currentUser.bio,
        links: currentUser.links,
        profileImage: currentUser.profileImage,
        theme: currentUser.theme,
      },
    });
  } catch (err) {
    console.error("Customize profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Public GET route
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "username bio profileImage links theme createdAt"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Upload profile image and return the path
export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: update profileImage directly if target === "profile"
    const target = req.body.target;

    if (target === "profile") {
      user.profileImage = imageUrl;
      await user.save();
    }

    return res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (err) {
    console.error("Image upload error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

