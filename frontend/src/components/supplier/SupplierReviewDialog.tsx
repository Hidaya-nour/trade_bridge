import React from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import supplierService from "@/services/supplier.service";

type SupplierReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  supplierName: string;
  onSubmitted?: () => void;
};

export const SupplierReviewDialog: React.FC<SupplierReviewDialogProps> = ({
  open,
  onOpenChange,
  supplierId,
  supplierName,
  onSubmitted,
}) => {
  const [checking, setChecking] = React.useState(false);
  const [canReview, setCanReview] = React.useState<boolean | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    const run = async () => {
      setChecking(true);
      setCanReview(null);
      try {
        const response = await supplierService.getReviewEligibility(supplierId);
        setCanReview(Boolean(response.data.can_review));
      } catch (error: any) {
        console.error("Review eligibility check failed", error);
        setCanReview(false);
      } finally {
        setChecking(false);
      }
    };

    void run();
  }, [open, supplierId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await supplierService.submitReview(supplierId, {
        rating,
        comment: comment.trim(),
      });
      toast.success("Thanks! Your supplier rating was submitted.");
      onSubmitted?.();
      onOpenChange(false);
      setComment("");
      setRating(5);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Rate {supplierName}</DialogTitle>
          <DialogDescription>
            Supplier ratings are only available after you’ve completed an order
            with them.
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="text-sm text-muted-foreground">Checking eligibility…</div>
        ) : canReview ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Rating</div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  </button>
                ))}
                <span className="text-sm ml-2">{rating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Comment (optional)</div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about quality, communication, delivery, etc."
                rows={4}
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            You can’t rate this supplier yet. Once you’ve received an order from
            them, you’ll be able to leave a rating here.
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canReview || checking || submitting}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierReviewDialog;

