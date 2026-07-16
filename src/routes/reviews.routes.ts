import {
    Router,
    type Response,
    type NextFunction,
  } from "express";
  
  import {
    authenticateToken,
    type AuthenticatedRequest,
  } from "../middleware/auth.middleware.js";
  
  import {
    createReview,
    deleteReview,
    getReviewsForEvent,
    getReviewsForUser,
    updateReview,
  } from "../services/review.service.mjs";
  
  const router = Router();


  
  interface EventParams {
    eventId: string;
  }
  
  interface ReviewParams {
    reviewId: string;
  }
  
  interface CreateReviewBody {
    rating?: number;
    comment?: string;
  }
  
  interface UpdateReviewBody {
    rating?: number;
    comment?: string;
  }
  
  // Anyone can view reviews for an event.
  router.get(
    "/events/:eventId/reviews",
    async (req, res, next) => {
      try {
        const result = await getReviewsForEvent(
          req.params.eventId
        );
  
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Signed-in user creates a review for an event.
  router.post(
    "/events/:eventId/reviews",
    authenticateToken,
    async (
      req: AuthenticatedRequest & {
        params: EventParams;
        body: CreateReviewBody;
      },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const user = req.user;
  
        if (!user) {
          res.status(401).json({
            error: "You must be signed in to leave a review.",
          });
          return;
        }
  
        const rating = Number(req.body.rating);
        const comment =
          typeof req.body.comment === "string"
            ? req.body.comment
            : "";
  
        const profileName = (user as { profileName?: string }).profileName;

        const review = await createReview({
          eventId: req.params.eventId,
          userId: user.id,
          userName: user.name || "Rexburg Connect User",
          profileName: profileName || "Rexburg Connect User",
          rating,
          comment,
        });
  
        res.status(201).json({
          message: "Review created successfully!",
          review,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Signed-in user gets their own reviews.
  router.get(
    "/reviews/me",
    authenticateToken,
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const user = req.user;
  
        if (!user) {
          res.status(401).json({
            error: "You must be signed in.",
          });
          return;
        }
  
        const reviews = await getReviewsForUser(user.id);
  
        res.status(200).json({
          reviews,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Signed-in user edits their own review.
  router.patch(
    "/reviews/:reviewId",
    authenticateToken,
    async (
      req: AuthenticatedRequest & {
        params: ReviewParams;
        body: UpdateReviewBody;
      },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const user = req.user;
  
        if (!user) {
          res.status(401).json({
            error: "You must be signed in.",
          });
          return;
        }
  
        const review = await updateReview({
          reviewId: req.params.reviewId,
          userId: user.id,
          rating:
            req.body.rating === undefined
              ? undefined
              : Number(req.body.rating),
          comment: req.body.comment,
        });
  
        res.status(200).json({
          message: "Review updated successfully!",
          review,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Signed-in user deletes their own review.
  router.delete(
    "/reviews/:reviewId",
    authenticateToken,
    async (
      req: AuthenticatedRequest & {
        params: ReviewParams;
      },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const user = req.user;
  
        if (!user) {
          res.status(401).json({
            error: "You must be signed in.",
          });
          return;
        }
  
        await deleteReview(
          req.params.reviewId,
          user.id
        );
  
        res.status(200).json({
          message: "Review deleted successfully!",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  
  export default router;