const { model, Schema } = require("mongoose");

const postSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageId: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        comment: {
          type: String,
          required: true,
        },
        createdAtDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAtDate: {
      type: Date,
      default:  Date.now,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
