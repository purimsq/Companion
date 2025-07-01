import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function LoadingScreen() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-warm flex items-center justify-center z-50 hero-pattern">
      <div className="text-center slide-in-up">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Page flip animation */}
          <div className="absolute inset-0 bg-white rounded-lg shadow-soft transform rotate-3 opacity-60 page-flip"></div>
          <div className="absolute inset-0 bg-cream rounded-lg shadow-soft-lg transform -rotate-2 page-flip" style={{ animationDelay: "0.2s" }}></div>
          <div className="absolute inset-0 bg-warm-beige rounded-lg shadow-warm flex items-center justify-center page-flip" style={{ animationDelay: "0.4s" }}>
            <CheckCircle className="w-12 h-12 text-soft-golden" />
          </div>
        </div>
        <h2 className="text-2xl font-medium text-charcoal mb-2">StudyCompanion</h2>
        <p className="text-soft-black/70">Preparing your study sanctuary...</p>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-soft-golden rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-soft-golden rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-soft-golden rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
