import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

type NotificationCounts = {
  total: number;
  unread: number;
};

type NotificationPreferences = {
  emailOrders: boolean;
  emailPromotions: boolean;
  pushOrders: boolean;
  pushShipping: boolean;
};

type NotificationsTabProps = {
  notificationCounts: NotificationCounts;
  markAllNotificationsRead: () => Promise<void> | void;
  clearAllNotifications: () => Promise<void> | void;
  notifications: NotificationPreferences;
};

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notificationCounts,
  markAllNotificationsRead,
  clearAllNotifications,
  notifications,
}) => {
  return (
    <TabsContent value="notifications" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <p className="text-sm font-medium">Live Notification Status</p>
              <p className="text-xs text-muted-foreground">
                Total: {notificationCounts.total} | Unread:{" "}
                {notificationCounts.unread}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void markAllNotificationsRead()}
                disabled={notificationCounts.unread === 0}
              >
                Mark All Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => void clearAllNotifications()}
                disabled={notificationCounts.total === 0}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Email Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailOrders" className="text-sm">
                    Order Updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive emails about order confirmations, shipping, and
                    delivery
                  </p>
                </div>
                <Switch
                  id="emailOrders"
                  defaultChecked={notifications.emailOrders}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailPromotions" className="text-sm">
                    Promotions & Offers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive emails about sales, discounts, and special offers
                  </p>
                </div>
                <Switch
                  id="emailPromotions"
                  defaultChecked={notifications.emailPromotions}
                />
              </div>
              <Separator />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-4">Push Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushOrders" className="text-sm">
                    Order Updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications for order status changes
                  </p>
                </div>
                <Switch
                  id="pushOrders"
                  defaultChecked={notifications.pushOrders}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushShipping" className="text-sm">
                    Shipping Updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications when orders ship
                  </p>
                </div>
                <Switch
                  id="pushShipping"
                  defaultChecked={notifications.pushShipping}
                />
              </div>
            </div>
          </div>

          <Separator />
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default NotificationsTab;
