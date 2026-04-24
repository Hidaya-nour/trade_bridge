import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export const AccountSuspendedNotice: React.FC<{ title?: string }> = ({
  title = "Account Suspended",
}) => {
  const navigate = useNavigate();
  const { accountBlocked, setAccountBlocked } = useAuthStore();

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

