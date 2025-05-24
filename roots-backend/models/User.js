import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    links: [
      {
        title: String,
        url: String,
        icon: String,
      },
    ],
    theme: {
      color: { type: String, default: "#000000" },
      background: { type: String, default: "#ffffff" },
      font: { type: String, default: "default" },
    },

    views: { type: Number, default: 0 }, // 👈 new field
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
