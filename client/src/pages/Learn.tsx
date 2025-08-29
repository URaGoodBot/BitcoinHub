import { LearningPaths } from "@/components/LearningPaths";
import { GraduationCap } from 'lucide-react';

const Learn = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-muted/20 pb-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bitcoin Learning Hub</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Choose your personalized Bitcoin education path. We've designed specific learning experiences 
          for Baby Boomers, Millennials, and an interactive economic game that bridges generations.
        </p>
      </header>

      <LearningPaths />
    </div>
  );
};

export default Learn;