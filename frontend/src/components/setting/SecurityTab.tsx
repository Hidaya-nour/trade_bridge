import React from "react";
import { Laptop, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SecurityTabProps = {
  passwordForm: PasswordForm;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  handleChangePassword: () => Promise<void> | void;
  securityMessage: string | null;
  isLoading: boolean;
  deviceHistory: Array<{
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
};

const SecurityTab: React.FC<SecurityTabProps> = ({
  passwordForm,
  setPasswordForm,
  handleChangePassword,
  securityMessage,
  isLoading,
  deviceHistory,
}) => {
  return (
    <TabsContent value="security" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your password and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Change Password</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleChangePassword()}
              disabled={isLoading}
            >
              Update Password
            </Button>
            {securityMessage && (
              <p className="text-sm text-muted-foreground">{securityMessage}</p>
            )}
          </div>

          {/* Active Sessions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Active Sessions</h3>
            <div className="space-y-3">
              {deviceHistory.map((device, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-background rounded-full flex items-center justify-center">
                      {device.device.includes("iPhone") ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Laptop className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {device.device}
                        {device.current && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {device.location} • Last active {device.lastActive}
                      </p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SecurityTab;
