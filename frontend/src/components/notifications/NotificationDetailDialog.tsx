import React from "react";

import type { Notification } from "@/types/notification.types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: Notification | null;
  onDelete?: (id: string) => void | Promise<void>;
};

const formatTimestamp = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const NotificationDetailDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  notification,
  onDelete,
}) => {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{notification.title}</span>
            <Badge variant="outline" className="capitalize">
              {String(notification.type || "notification")}
            </Badge>
            {!notification.is_read && (
              <Badge variant="secondary" className="ml-auto">
                New
              </Badge>
            )}
          </DialogTitle>
          <div className="text-xs text-muted-foreground">
            {formatTimestamp(notification.created_at)}
          </div>
        </DialogHeader>

        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {notification.message}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(notification.id)}
            >
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailDialog;

