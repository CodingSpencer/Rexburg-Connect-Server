import mongoose, { isValidObjectId } from "mongoose";
import { EventModel } from "../models/event.model.mjs";
import { ReviewModel } from "../models/review.model.mjs";

export interface CreateReviewInput {
  eventId: string;
  userId: string;
  userName: string;
  profileName: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  reviewId: string;
  userId: string;
  rating?: number;
  comment?: string;
}

export async function createReview(input: CreateReviewInput) {
  const {
    eventId,
    userId,
    userName,
    profileName,
    rating,
    comment,
  } = input;

  if (!isValidObjectId(eventId)) {
    throw Object.assign(new Error("Invalid event ID."), {
      statusCode: 400,
    });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw Object.assign(
      new Error("Rating must be a whole number between 1 and 5."),
      {
        statusCode: 400,
      }
    );
  }

  const cleanedComment = comment?.trim();

  if (!cleanedComment || cleanedComment.length < 2) {
    throw Object.assign(
      new Error("Please enter a review comment."),
      {
        statusCode: 400,
      }
    );
  }

  const event = await EventModel.findById(eventId);

  if (!event) {
    throw Object.assign(new Error("Event not found."), {
      statusCode: 404,
    });
  }

  const existingReview = await ReviewModel.findOne({
    eventId,
    userId,
  });

  if (existingReview) {
    throw Object.assign(
      new Error("You have already reviewed this event."),
      {
        statusCode: 409,
      }
    );
  }

  return ReviewModel.create({
    eventId,
    userId,
    userName,
    profileName,
    rating,
    comment: cleanedComment,
  });
}

export async function getReviewsForEvent(eventId: string) {
  if (!isValidObjectId(eventId)) {
    throw Object.assign(new Error("Invalid event ID."), {
      statusCode: 400,
    });
  }

  const event = await EventModel.exists({
    _id: eventId,
  });

  if (!event) {
    throw Object.assign(new Error("Event not found."), {
      statusCode: 404,
    });
  }

  const reviews = await ReviewModel.find({
    eventId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount === 0
      ? 0
      : Number(
          (
            reviews.reduce(
              (total, review) => total + review.rating,
              0
            ) / reviewCount
          ).toFixed(1)
        );

  // Attach current profileName from the User collection for every review.
  // Uses string comparison on _id to avoid type coercion issues.
  const userIds = reviews.map((r) => r.userId);
  const validIds = userIds.filter((id) => isValidObjectId(id));

  let profileNameById = new Map<string, string>();

  if (validIds.length > 0) {
    try {
      // Query the better-auth "user" collection directly (not the Mongoose "users" collection)
      const db = mongoose.connection.db!;
      const users = await db
        .collection("user")
        .find({ _id: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) } })
        .project({ profileName: 1 })
        .toArray();

      profileNameById = new Map(
        users.map((u: any) => [String(u._id), u.profileName || ""])
      );
    } catch {
      // If the lookup fails for any reason, reviews will keep their stored profileName
    }
  }

  const reviewsWithProfile = reviews.map((review) => ({
    ...review,
    profileName:
      profileNameById.get(review.userId) ||
      review.profileName ||
      review.userName,
  }));

  return {
    reviews: reviewsWithProfile,
    reviewCount,
    averageRating,
  };
}

export async function getReviewsForUser(userId: string) {
  return ReviewModel.find({
    userId,
  })
    .populate({
      path: "eventId",
      select: "title date location image",
    })
    .sort({
      createdAt: -1,
    })
    .lean();
}

export async function updateReview(input: UpdateReviewInput) {
  const {
    reviewId,
    userId,
    rating,
    comment,
  } = input;

  if (!isValidObjectId(reviewId)) {
    throw Object.assign(new Error("Invalid review ID."), {
      statusCode: 400,
    });
  }

  const review = await ReviewModel.findById(reviewId);

  if (!review) {
    throw Object.assign(new Error("Review not found."), {
      statusCode: 404,
    });
  }

  if (review.userId !== userId) {
    throw Object.assign(
      new Error("You can only edit your own reviews."),
      {
        statusCode: 403,
      }
    );
  }

  if (rating !== undefined) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw Object.assign(
        new Error("Rating must be a whole number between 1 and 5."),
        {
          statusCode: 400,
        }
      );
    }

    review.rating = rating;
  }

  if (comment !== undefined) {
    const cleanedComment = comment.trim();

    if (
      cleanedComment.length < 2 ||
      cleanedComment.length > 1000
    ) {
      throw Object.assign(
        new Error(
          "Comment must contain between 2 and 1,000 characters."
        ),
        {
          statusCode: 400,
        }
      );
    }

    review.comment = cleanedComment;
  }

  await review.save();

  return review;
}

export async function deleteReview(
  reviewId: string,
  userId: string
) {
  if (!isValidObjectId(reviewId)) {
    throw Object.assign(new Error("Invalid review ID."), {
      statusCode: 400,
    });
  }

  const review = await ReviewModel.findById(reviewId);

  if (!review) {
    throw Object.assign(new Error("Review not found."), {
      statusCode: 404,
    });
  }

  if (review.userId !== userId) {
    throw Object.assign(
      new Error("You can only delete your own reviews."),
      {
        statusCode: 403,
      }
    );
  }

  await review.deleteOne();
}