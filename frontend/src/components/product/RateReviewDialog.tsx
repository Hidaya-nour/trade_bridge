import React from "react";
import { Star } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  review: string;
  onReviewChange: (review: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export const RateReviewDialog: React.FC<RateReviewDialogProps> = ({
  open,
  onOpenChange,
  productName,
  rating,
  onRatingChange,
  review,
  onReviewChange,
  onSubmit,
  submitLabel = "Submit Review",
  cancelLabel = "Cancel",
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rate Product</AlertDialogTitle>
          <AlertDialogDescription>
            Share your feedback{productName ? ` about ${productName}` : ""}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={() => onRatingChange(star)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </Button>
              ))}
              <span className="text-sm ml-2">{rating}/5</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Write your review..."
              value={review}
              onChange={(e) => onReviewChange(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
