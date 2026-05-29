import mongoose from "mongoose";
import {
  UserReward,
  RewardTransaction,
  RewardRedemption,
} from "../models/reward.model";

// Point values for different actions
export const REWARD_POINTS = {
  ITEM_RETURNED: 100, // User gets 100 points for returning a found item
  ITEM_FOUND: 20, // Bonus for finding an item
  ITEM_CLAIMED: 100, // Bonus for claiming your lost item
  WEEKLY_STREAK_BONUS: 50,
  MONTHLY_STREAK_BONUS: 200,
};

// Get or create user reward document
export const getOrCreateUserReward = async (userId: string) => {
  let userReward = await UserReward.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!userReward) {
    userReward = await UserReward.create({
      userId: new mongoose.Types.ObjectId(userId),
      totalPoints: 0,
      availablePoints: 0,
      earnedPoints: 0,
      redeemedPoints: 0,
      itemsReturned: 0,
      itemsFound: 0,
      itemsClaimed: 0,
      streak: 0,
      lastActiveDate: new Date(),
    });
  }

  return userReward;
};

// Add points when item is returned (the finder gets points)
export const addPointsForItemReturn = async (
  userId: string,
  itemId: string,
  itemName: string,
) => {
  const amount = REWARD_POINTS.ITEM_RETURNED;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userReward = await getOrCreateUserReward(userId);

    userReward.totalPoints += amount;
    userReward.availablePoints += amount;
    userReward.earnedPoints += amount;
    userReward.itemsReturned += 1;
    userReward.lastActiveDate = new Date();
    await userReward.save({ session });

    await RewardTransaction.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          amount,
          type: "earn_item_returned",
          description: `🎉 You earned ${amount} points for successfully returning "${itemName}" to its owner!`,
          referenceId: new mongoose.Types.ObjectId(itemId),
          referenceModel: "LostItem",
          status: "completed",
          metadata: new Map([["itemName", itemName]]),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return {
      success: true,
      points: amount,
      totalPoints: userReward.totalPoints,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding points for item return:", error);
    return { success: false, points: 0, error: error };
  } finally {
    session.endSession();
  }
};

// Add points when item is found (finder bonus)
export const addPointsForItemFound = async (
  userId: string,
  itemId: string,
  itemName: string,
) => {
  const amount = REWARD_POINTS.ITEM_FOUND;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userReward = await getOrCreateUserReward(userId);

    userReward.totalPoints += amount;
    userReward.availablePoints += amount;
    userReward.earnedPoints += amount;
    userReward.itemsFound += 1;
    await userReward.save({ session });

    const transaction = await RewardTransaction.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          amount,
          type: "earn_item_found",
          description: `Bonus for finding "${itemName}"`,
          referenceId: new mongoose.Types.ObjectId(itemId),
          referenceModel: "LostItem",
          status: "completed",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return {
      success: true,
      points: amount,
      totalPoints: userReward.totalPoints,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Add points when item is claimed (owner bonus)
export const addPointsForItemClaimed = async (
  userId: string,
  itemId: string,
  itemName: string,
) => {
  const amount = REWARD_POINTS.ITEM_CLAIMED;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userReward = await getOrCreateUserReward(userId);

    userReward.totalPoints += amount;
    userReward.availablePoints += amount;
    userReward.earnedPoints += amount;
    userReward.itemsClaimed += 1;
    await userReward.save({ session });

    await RewardTransaction.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          amount,
          type: "earn_item_claimed",
          description: `✅ You earned ${amount} points for claiming your item "${itemName}"!`,
          referenceId: new mongoose.Types.ObjectId(itemId),
          referenceModel: "LostItem",
          status: "completed",
          metadata: new Map([["itemName", itemName]]),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return {
      success: true,
      points: amount,
      totalPoints: userReward.totalPoints,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding points for item claimed:", error);
    return { success: false, points: 0, error: error };
  } finally {
    session.endSession();
  }
};

// Deduct points for redemption
export const deductPointsForRedemption = async (
  userId: string,
  points: number,
  redemptionId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userReward = await getOrCreateUserReward(userId);

    if (userReward.availablePoints < points) {
      throw new Error("Insufficient points");
    }

    userReward.availablePoints -= points;
    userReward.redeemedPoints += points;
    await userReward.save({ session });

    const transaction = await RewardTransaction.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          amount: -points,
          type: "redeem_reward",
          description: `Redeemed ${points} points for reward`,
          referenceId: new mongoose.Types.ObjectId(redemptionId),
          referenceModel: "RewardRedemption",
          status: "completed",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return { success: true, remainingPoints: userReward.availablePoints };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get user reward summary
export const getUserRewardSummary = async (userId: string) => {
  const userReward = await getOrCreateUserReward(userId);

  const recentTransactions = await RewardTransaction.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalPoints: userReward.totalPoints,
    availablePoints: userReward.availablePoints,
    earnedPoints: userReward.earnedPoints,
    redeemedPoints: userReward.redeemedPoints,
    itemsReturned: userReward.itemsReturned,
    itemsFound: userReward.itemsFound,
    itemsClaimed: userReward.itemsClaimed,
    streak: userReward.streak,
    recentTransactions,
  };
};

// Get available rewards for redemption
export const getAvailableRewards = async () => {
  // This could come from a database or config
  return [
    {
      id: "reward_1",
      name: "₹100 Gift Card",
      description: "Amazon/Flipkart gift card worth ₹100",
      points: 1000,
      type: "gift_card",
      value: 100,
    },
    {
      id: "reward_2",
      name: "₹250 Gift Card",
      description: "Amazon/Flipkart gift card worth ₹250",
      points: 2500,
      type: "gift_card",
      value: 250,
    },
    {
      id: "reward_3",
      name: "₹500 Gift Card",
      description: "Amazon/Flipkart gift card worth ₹500",
      points: 5000,
      type: "gift_card",
      value: 500,
    },
    {
      id: "reward_4",
      name: "Coffee Voucher",
      description: "Free coffee at campus cafeteria",
      points: 500,
      type: "voucher",
      value: 50,
    },
    {
      id: "reward_5",
      name: "Campus Merchandise",
      description: "College t-shirt or hoodie",
      points: 3000,
      type: "merchandise",
      value: 300,
    },
    {
      id: "reward_6",
      name: "Charity Donation",
      description: "Donate to a cause of your choice",
      points: 100,
      type: "donation",
      value: 10,
    },
  ];
};

// Create redemption request
export const createRedemptionRequest = async (
  userId: string,
  rewardId: string,
  rewardData: any,
  deliveryInfo?: any,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userReward = await getOrCreateUserReward(userId);

    if (userReward.availablePoints < rewardData.points) {
      throw new Error("Insufficient points");
    }

    const redemption = await RewardRedemption.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          points: rewardData.points,
          rewardType: rewardData.type,
          item: {
            id: rewardData.id,
            name: rewardData.name,
            description: rewardData.description,
            value: rewardData.value,
          },
          status: "pending",
          deliveryInfo,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return { success: true, redemption: redemption[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
