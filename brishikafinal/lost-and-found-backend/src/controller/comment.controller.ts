import { Request, Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/comment.model";
import LostItem from "../models/lostItem.modal";
import User from "../models/user.model";
import { AuthRequest } from "../types/middlewareTypes";

// CREATE

// export const addComment = async (
//   req: AuthRequest,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const { itemId } = req.params;
//     const { content, parentCommentId, mentions, media } = req.body;

//     // Validate itemId
//     if (!mongoose.Types.ObjectId.isValid(itemId as any)) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid item ID",
//       });
//       return;
//     }

//     // Check authentication
//     if (!req.user?._id) {
//       res.status(401).json({
//         success: false,
//         message: "Not authenticated",
//       });
//       return;
//     }

//     // Check if lost item exists
//     const lostItem = await LostItem.findById(itemId);
//     if (!lostItem) {
//       res.status(404).json({
//         success: false,
//         message: "Lost item not found",
//       });
//       return;
//     }

//     // Validate content
//     if (!content || content.trim().length === 0) {
//       res.status(400).json({
//         success: false,
//         message: "Comment content is required",
//       });
//       return;
//     }

//     // If this is a reply, validate parent comment
//     if (parentCommentId) {
//       if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
//         res.status(400).json({
//           success: false,
//           message: "Invalid parent comment ID",
//         });
//         return;
//       }

//       const parentComment = await Comment.findById(parentCommentId);
//       if (!parentComment) {
//         res.status(404).json({
//           success: false,
//           message: "Parent comment not found",
//         });
//         return;
//       }

//       // Check if parent comment belongs to the same lost item
//       if (parentComment.itemId.toString() !== itemId) {
//         res.status(400).json({
//           success: false,
//           message: "Parent comment does not belong to this item",
//         });
//         return;
//       }

//       // Check if trying to reply to a reply (Instagram-style - only one level)
//       if (parentComment.parentCommentId) {
//         res.status(400).json({
//           success: false,
//           message:
//             "Cannot reply to a reply. Only one level of replies is allowed.",
//         });
//         return;
//       }
//     }

//     // Process mentions to get usernames
//     const processedMentions = [];
//     if (mentions && mentions.length > 0) {
//       for (const mention of mentions) {
//         const user = await User.findById(mention.userId).select("name");
//         if (user) {
//           processedMentions.push({
//             userId: mention.userId,
//             username: user.name,
//             indices: mention.indices,
//           });
//         }
//       }
//     }

//     // Extract hashtags from content
//     const hashtagRegex = /#(\w+)/g;
//     const hashtags =
//       content.match(hashtagRegex)?.map((tag: any) => tag.toLowerCase()) || [];

//     // Create comment
//     const comment = await Comment.create({
//       content,
//       userId: req.user._id,
//       itemId,
//       parentCommentId: parentCommentId || null,
//       mentions: processedMentions,
//       hashtags,
//       media: media || [],
//       likes: [],
//       likesCount: 0,
//       isEdited: false,
//       editHistory: [],
//       isFlagged: false,
//       flagCount: 0,
//       flags: [],
//       isPinned: false,
//       isHidden: false,
//       isActive: true,
//       replyCount: 0,
//     });

//     // Populate user details
//     await comment.populate("userId", "name email avatar");

//     res.status(201).json({
//       success: true,
//       message: "Comment added successfully",
//       data: comment,
//     });
//   } catch (error: any) {
//     console.error("Add comment error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Error adding comment",
//     });
//   }
// };

export const addComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { content, parentCommentId, mentions, media } = req.body;

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    // Check authentication
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Check if lost item exists
    const lostItem = await LostItem.findById(itemId).populate(
      "reportedBy",
      "_id name",
    );
    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
      return;
    }

    let parentComment = null;
    let isReply = false;

    // If this is a reply, validate parent comment
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        res.status(400).json({
          success: false,
          message: "Invalid parent comment ID",
        });
        return;
      }

      parentComment = await Comment.findById(parentCommentId).populate(
        "userId",
        "_id name",
      );
      if (!parentComment) {
        res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
        return;
      }

      // Check if parent comment belongs to the same lost item
      if (parentComment.itemId.toString() !== itemId) {
        res.status(400).json({
          success: false,
          message: "Parent comment does not belong to this item",
        });
        return;
      }

      // Check if trying to reply to a reply
      if (parentComment.parentCommentId) {
        res.status(400).json({
          success: false,
          message:
            "Cannot reply to a reply. Only one level of replies is allowed.",
        });
        return;
      }

      isReply = true;
    }

    // Process mentions to get usernames
    const processedMentions = [];
    if (mentions && mentions.length > 0) {
      for (const mention of mentions) {
        const user = await User.findById(mention.userId).select("name");
        if (user) {
          processedMentions.push({
            userId: mention.userId,
            username: user.name,
            indices: mention.indices,
          });
        }
      }
    }

    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const hashtags =
      content.match(hashtagRegex)?.map((tag: any) => tag.toLowerCase()) || [];

    // Create comment
    const comment = await Comment.create({
      content,
      userId: req.user._id,
      itemId,
      parentCommentId: parentCommentId || null,
      mentions: processedMentions,
      hashtags,
      media: media || [],
      likes: [],
      likesCount: 0,
      isEdited: false,
      editHistory: [],
      isFlagged: false,
      flagCount: 0,
      flags: [],
      isPinned: false,
      isHidden: false,
      isActive: true,
      replyCount: 0,
    });

    // Populate user details
    await comment.populate("userId", "name email avatar");

    //  CREATE NOTIFICATIONS

    const Notification = mongoose.model("Notification");

    // 1. Notify the post owner about the comment (if commenter is not the owner)
    if (lostItem.reportedBy._id.toString() !== req.user._id.toString()) {
      const commentPreview =
        content.length > 50 ? content.substring(0, 50) + "..." : content;

      await Notification.create({
        userId: lostItem.reportedBy._id,
        type: "comment",
        title: "New Comment on Your Post",
        message: `${req.user.name} commented on "${lostItem.itemName}": "${commentPreview}"`,
        priority: "medium",
        data: {
          postId: itemId,
          commentId: comment._id,
          userId: req.user._id,
          postTitle: lostItem.itemName,
          commentContent: commentPreview,
        },
      });
    }

    // 2. If it's a reply, notify the parent comment owner
    if (
      isReply &&
      parentComment &&
      parentComment.userId._id.toString() !== req.user._id.toString()
    ) {
      const replyPreview =
        content.length > 50 ? content.substring(0, 50) + "..." : content;

      await Notification.create({
        userId: parentComment.userId._id,
        type: "reply",
        title: "New Reply to Your Comment",
        message: `${req.user.name} replied to your comment: "${replyPreview}"`,
        priority: "medium",
        data: {
          postId: itemId,
          commentId: comment._id,
          parentCommentId: parentCommentId,
          userId: req.user._id,
          postTitle: lostItem.itemName,
          commentContent: replyPreview,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error: any) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding comment",
    });
  }
};

// READ

export const getComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const {
      page = 1,
      limit = 20,
      sort = "latest",
      includeReplies = "true",
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(itemId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "popular":
        sortOption = { likesCount: -1, createdAt: -1 };
        break;
      case "pinned":
        sortOption = { isPinned: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Get top-level comments (not replies)
    const comments = await Comment.find({
      itemId,
      parentCommentId: null,
      isActive: true,
      isHidden: false,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name email avatar")
      .populate("mentions.userId", "name email avatar")
      .lean();

    // Get replies for each comment if requested
    if (includeReplies === "true") {
      for (const comment of comments) {
        const replies = await Comment.find({
          parentCommentId: comment._id,
          isActive: true,
          isHidden: false,
        })
          .sort({ createdAt: 1 })
          .limit(3) // Show only first 3 replies initially
          .populate("userId", "name email avatar")
          .lean();

        (comment as any).replies = replies;

        const totalReplies = await Comment.countDocuments({
          parentCommentId: comment._id,
          isActive: true,
          isHidden: false,
        });

        (comment as any).hasMoreReplies = totalReplies > replies.length;
        comment.replyCount = totalReplies;
      }
    }

    const total = await Comment.countDocuments({
      itemId,
      parentCommentId: null,
      isActive: true,
      isHidden: false,
    });

    const totalReplies = await Comment.countDocuments({
      itemId,
      parentCommentId: { $ne: null },
      isActive: true,
      isHidden: false,
    });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        totalReplies,
      },
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching comments",
    });
  }
};

export const getReplies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    const replies = await Comment.find({
      parentCommentId: commentId,
      isActive: true,
      isHidden: false,
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name email avatar")
      .populate("mentions.userId", "name email avatar");

    const total = await Comment.countDocuments({
      parentCommentId: commentId,
      isActive: true,
      isHidden: false,
    });

    res.status(200).json({
      success: true,
      data: replies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get replies error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching replies",
    });
  }
};

export const getCommentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    const comment = await Comment.findOne({
      _id: commentId,
      isActive: true,
      isHidden: false,
    })
      .populate("userId", "name email avatar")
      .populate("mentions.userId", "name email avatar");

    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    console.error("Get comment by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching comment",
    });
  }
};

export const getUserComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find({
      userId,
      isActive: true,
      isHidden: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("itemId", "itemName images")
      .populate("mentions.userId", "name email avatar");

    const total = await Comment.countDocuments({
      userId,
      isActive: true,
      isHidden: false,
    });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get user comments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching user comments",
    });
  }
};

// UPDATE

export const updateComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content, mentions, media } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: "You can only update your own comments",
      });
      return;
    }

    // Save edit history
    comment.editHistory.push({
      content: comment.content,
      editedAt: new Date(),
    });

    // Update content
    comment.content = content;

    // Update mentions if provided
    if (mentions) {
      const processedMentions = [];
      for (const mention of mentions) {
        const user = await User.findById(mention.userId).select("name");
        if (user) {
          processedMentions.push({
            userId: mention.userId,
            username: user.name,
            indices: mention.indices,
          });
        }
      }
      comment.mentions = processedMentions;
    }

    // Update hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags =
      content.match(hashtagRegex)?.map((tag: any) => tag.toLowerCase()) || [];
    comment.hashtags = hashtags;

    // Update media if provided
    if (media) {
      comment.media = media;
    }

    comment.isEdited = true;
    await comment.save();

    await comment.populate("userId", "name email avatar");
    await comment.populate("mentions.userId", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error: any) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating comment",
    });
  }
};

export const pinComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { isPinned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can pin comments",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    comment.isPinned = isPinned !== undefined ? isPinned : !comment.isPinned;
    await comment.save();

    res.status(200).json({
      success: true,
      message: `Comment ${comment.isPinned ? "pinned" : "unpinned"} successfully`,
      data: { isPinned: comment.isPinned },
    });
  } catch (error: any) {
    console.error("Pin comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error pinning comment",
    });
  }
};

export const hideComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { isHidden } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can hide comments",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    comment.isHidden = isHidden !== undefined ? isHidden : !comment.isHidden;
    await comment.save();

    res.status(200).json({
      success: true,
      message: `Comment ${comment.isHidden ? "hidden" : "unhidden"} successfully`,
      data: { isHidden: comment.isHidden },
    });
  } catch (error: any) {
    console.error("Hide comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error hiding comment",
    });
  }
};

// DELETE

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    // Check ownership or admin
    const isAdmin =
      req.user.role === "college_admin" || req.user.role === "super_admin";
    if (comment.userId.toString() !== req.user._id.toString() && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
      return;
    }

    // Soft delete
    comment.isActive = false;
    await comment.save();

    // Also soft delete all replies
    if (!comment.parentCommentId) {
      await Comment.updateMany(
        { parentCommentId: commentId },
        { isActive: false },
      );
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting comment",
    });
  }
};

export const permanentDeleteComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can permanently delete comments",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    // Permanently delete
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment permanently deleted",
    });
  } catch (error: any) {
    console.error("Permanent delete comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error permanently deleting comment",
    });
  }
};

// SOCIAL ACTIONS

export const likeComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    await comment.like(new mongoose.Types.ObjectId(req.user._id));

    //  CREATE NOTIFICATION
    // Notify comment owner about like (if liker is not the owner)
    if (comment.userId._id.toString() !== req.user._id.toString()) {
      const Notification = mongoose.model("Notification");

      await Notification.create({
        userId: comment.userId._id,
        type: "like",
        title: "Someone Liked Your Comment",
        message: `${req.user.name} liked your comment.`,
        priority: "low",
        data: {
          postId: comment.itemId._id,
          commentId: comment._id,
          userId: req.user._id,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment liked",
      data: { likesCount: comment.likesCount },
    });
  } catch (error: any) {
    console.error("Like comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error liking comment",
    });
  }
};

export const unlikeComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    await comment.unlike(new mongoose.Types.ObjectId(req.user._id));

    res.status(200).json({
      success: true,
      message: "Comment unliked",
      data: { likesCount: comment.likesCount },
    });
  } catch (error: any) {
    console.error("Unlike comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error unliking comment",
    });
  }
};

export const flagComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!reason) {
      res.status(400).json({
        success: false,
        message: "Please provide a reason for flagging",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    await comment.flag(new mongoose.Types.ObjectId(req.user._id), reason);

    res.status(200).json({
      success: true,
      message: "Comment flagged successfully",
      data: {
        flagCount: comment.flagCount,
        isFlagged: comment.isFlagged,
      },
    });
  } catch (error: any) {
    console.error("Flag comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error flagging comment",
    });
  }
};

// ADMIN ACTIONS

export const getFlaggedComments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can view flagged comments",
      });
      return;
    }

    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const flaggedComments = await Comment.find({
      isFlagged: true,
      flagCount: { $gt: 0 },
    })
      .sort({ flagCount: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name email")
      .populate("flags.userId", "name email")
      .populate("itemId", "itemName");

    const total = await Comment.countDocuments({
      isFlagged: true,
      flagCount: { $gt: 0 },
    });

    res.status(200).json({
      success: true,
      data: flaggedComments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get flagged comments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching flagged comments",
    });
  }
};

export const resolveCommentFlags = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { action } = req.body; // 'keep' or 'remove'

    if (!mongoose.Types.ObjectId.isValid(commentId as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can resolve flags",
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    // Mark all flags as resolved
    comment.flags = comment.flags.map((flag) => ({
      ...flag,
      resolved: true,
      resolvedBy: new mongoose.Types.ObjectId(req.user?._id!),
      resolvedAt: new Date(),
    }));

    // If action is 'remove', hide the comment
    if (action === "remove") {
      comment.isActive = false;
      comment.isHidden = true;
    }

    comment.isFlagged = false;
    await comment.save();

    res.status(200).json({
      success: true,
      message: `Flags resolved successfully. Comment ${action === "remove" ? "hidden" : "kept visible"}.`,
    });
  } catch (error: any) {
    console.error("Resolve flags error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error resolving flags",
    });
  }
};
