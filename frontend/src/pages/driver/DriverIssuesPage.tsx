import React from "react";

export const DriverIssuesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Report Issues</h1>
      <p className="mt-2 text-muted-foreground">
        Submit delivery problems: damaged products, delays, failed attempts,
        vehicle breakdown.
      </p>
    </div>
  );
};

export default DriverIssuesPage;
