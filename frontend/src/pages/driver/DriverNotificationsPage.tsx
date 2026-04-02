import React from "react";

export const DriverNotificationsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Driver Notifications</h1>
      <p className="mt-2 text-muted-foreground">
        Assignment/order update alerts with unread indicator will be shown here.
      </p>
    </div>
  );
};

export default DriverNotificationsPage;
