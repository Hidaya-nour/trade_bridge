// LandingLayout.tsx
import { Outlet } from "react-router-dom";
import LandingFooter from "./LandingFooter";
import LandingHeader from "./LandingHeader";
import { Logo } from '../shared';

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Logo on ALL pages */}
      <div className="fixed top-4 left-4 z-50">
        <Logo variant="default" showText={false} />  {/* Icon only */}
        {/* OR with text: <Logo variant="default" showText={true} /> */}
      </div>
      <LandingHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
