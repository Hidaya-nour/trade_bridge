// Home.tsx
import { Link } from "react-router-dom";
import { LandingButton } from "../../components/landing/shared";

const Home = () => {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Connect Businesses Seamlessly
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            TradeBridge connects retailers, distributors, and factories in one
            digital marketplace
          </p>
          <div className="space-x-4">
            <Link to="/register">
              <LandingButton
                variant="primary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Get Started
              </LandingButton>
            </Link>
            <Link to="/how-it-works">
              <LandingButton
                variant="outline"
                className="border-white text-white hover:bg-blue-700"
              >
                Learn More
              </LandingButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
