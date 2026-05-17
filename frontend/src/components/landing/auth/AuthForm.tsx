// AuthForm.tsx
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LandingCard } from "../shared";

interface AuthFormProps {
  title?: string;
  subtitle?: string;
  headerContent?: ReactNode;
  children: ReactNode;
  alternateText: string;
  alternateLinkText: string;
  alternateLinkTo: string;
}

const AuthForm = ({
  title,
  subtitle,
  headerContent,
  children,
  alternateText,
  alternateLinkText,
  alternateLinkTo,
}: AuthFormProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <LandingCard
          title={title}
          subtitle={subtitle}
          headerContent={headerContent}
        >
          <div className="space-y-6">{children}</div>

          <p className="text-center mt-6 text-gray-600">
            {alternateText}{" "}
            <Link
              to={alternateLinkTo}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {alternateLinkText}
            </Link>
          </p>
        </LandingCard>
      </div>
    </div>
  );
};

export default AuthForm;
