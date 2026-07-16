import {
    Schema,
    model,
    type InferSchemaType,
  } from "mongoose";
  
  const reviewSchema = new Schema(
    {
      eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true,
      },
  
      userId: {
        type: String,
        required: true,
        index: true,
      },
  
      userName: {
        type: String,
        required: true,
        trim: true,
      },

      profileName: {
        type: String,
        required: false,
        trim: true,
      },
  
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
  
      comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 1000,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );
  
  // One review per user for each event.
  reviewSchema.index(
    {
      eventId: 1,
      userId: 1,
    },
    {
      unique: true,
    }
  );
  
  export type Review = InferSchemaType<typeof reviewSchema>;
  
  export const ReviewModel = model<Review>("Review", reviewSchema);