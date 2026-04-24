import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";

export const AccountSuspendedNotice: React.FC<{ title?: string }> = ({
  title = "Account Suspended",
}) => {
  const navigate = useNavigate();
  const { accountBlocked, setAccountBlocked } = useAuthStore();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitAppeal = async () => {
    const safeEmail = email.trim().toLowerCase();
    const safeMessage = message.trim();

    if (!safeEmail) {
      toast.error("Email is required.");
      return;
    }
    if (!safeMessage) {
      toast.error("Please describe why you should be unsuspended.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.appealSuspension({ email: safeEmail, message: safeMessage });
      toast.success("Appeal submitted. An admin will review it.");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit appeal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {accountBlocked?.message ||
              "Your account has been suspended. Please contact the admin to appeal."}
          </p>

          <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-medium">Submit an appeal</p>
            <div className="space-y-2">
              <Label htmlFor="appeal-email">Email</Label>
              <Input
                id="appeal-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appeal-message">Message</Label>
              <Textarea
                id="appeal-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what happened and why you should be unsuspended..."
                rows={5}
              />
            </div>
            <Button onClick={() => void submitAppeal()} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Appeal"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/support">Contact Support</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAccountBlocked(null);
                navigate("/login");
              }}
            >
              Login with another account
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setAccountBlocked(null);
                navigate("/");
              }}
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
