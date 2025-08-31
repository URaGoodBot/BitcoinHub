import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Users, Clock, Play, CheckCircle, ArrowRight, Gamepad2, TrendingUp } from 'lucide-react';
import { DollarDilemmaGame } from "./DollarDilemmaGame";
import { BitcoinTimeMachine } from "./BitcoinTimeMachine";
import { BitcoinBoomGame } from "./BitcoinBoomGame";
import { PolicySimulatorGame } from "./PolicySimulatorGame";
import { MillennialEscapeGame } from "./MillennialEscapeGame";
import { TreasureHuntGame } from "./TreasureHuntGame";
import { EscapeRoomGame } from "./EscapeRoomGame";
import { BitcoinQuestGame } from "./BitcoinQuestGame";

interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  estimatedTime: string;
  lessons?: Lesson[];
  isGame?: boolean;
  gameData?: any;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: string;
  description: string;
  completed?: boolean;
}

interface LearningPathsData {
  bitcoinBoom: LearningPath;
  policySimulator: LearningPath;
  millennialEscape: LearningPath;
  bitcoinTimeMachine: LearningPath;
  dollarDilemma: LearningPath;
  treasureHunt: LearningPath;
  escapeRoom: LearningPath;
  bitcoinQuest: LearningPath;
}

export function LearningPaths() {
  const [activeView, setActiveView] = useState<'paths' | 'path-details' | 'game'>('paths');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const { data: pathsData, isLoading } = useQuery<LearningPathsData>({
    queryKey: ['/api/learning/paths'],
    refetchOnWindowFocus: false
  });

  const handlePathSelect = (pathId: string) => {
    if (!pathsData) return;
    
    const path = Object.values(pathsData).find(p => p.id === pathId);
    if (path) {
      setSelectedPath(path);
      if (path.isGame) {
        setActiveView('game');
      } else {
        setActiveView('path-details');
      }
    }
  };

  const handleStartLesson = (lessonIndex: number) => {
    setCurrentLessonIndex(lessonIndex);
    // In a real app, this would navigate to lesson content
  };

  const handleBackToPaths = () => {
    setActiveView('paths');
    setSelectedPath(null);
    setCurrentLessonIndex(0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Game view
  if (activeView === 'game' && selectedPath?.isGame) {
    if (selectedPath.id === 'bitcoin-time-machine') {
      return (
        <BitcoinTimeMachine 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    } else if (selectedPath.id === 'bitcoin-boom-game') {
      return (
        <BitcoinBoomGame 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    } else if (selectedPath.id === 'boomer-policy-simulator') {
      return (
        <PolicySimulatorGame 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    } else if (selectedPath.id === 'millennial-escape-game') {
      return (
        <MillennialEscapeGame 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    } else if (selectedPath.id === 'bitcoin-treasure-hunt') {
      return (
        <TreasureHuntGame 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    } else if (selectedPath.id === 'crypto-escape-room') {
      return (
        <EscapeRoomGame 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    } else if (selectedPath.id === 'bitcoin-quest-game') {
      return (
        <BitcoinQuestGame 
          gameData={selectedPath.gameData}
          onBack={handleBackToPaths}
        />
      );
    } else {
      return (
        <DollarDilemmaGame 
          gameData={selectedPath.gameData} 
          onBack={handleBackToPaths}
        />
      );
    }
  }

  // Path details view
  if (activeView === 'path-details' && selectedPath && !selectedPath.isGame) {
    const completedLessons = selectedPath.lessons?.filter(l => l.completed).length || 0;
    const totalLessons = selectedPath.lessons?.length || 0;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBackToPaths}>
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back to Learning Paths
          </Button>
        </div>

        <Card className="bg-card border-muted/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{selectedPath.title}</CardTitle>
                <CardDescription className="text-base">{selectedPath.subtitle}</CardDescription>
                <p className="text-muted-foreground">{selectedPath.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${selectedPath.color} text-white text-2xl`}>
                {selectedPath.icon}
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {selectedPath.estimatedTime}
              </Badge>
              <Badge variant="outline">
                <BookOpen className="mr-1 h-3 w-3" />
                {totalLessons} lessons
              </Badge>
              <Badge variant="outline">
                {completedLessons}/{totalLessons} completed
              </Badge>
            </div>
            {totalLessons > 0 && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lessons</h3>
          <div className="space-y-3">
            {selectedPath.lessons?.map((lesson, index) => (
              <Card key={lesson.id} className="bg-card border-muted/20 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {lesson.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              <Clock className="inline h-3 w-3 mr-1" />
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartLesson(index)}
                      className="ml-4"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {lesson.completed ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main paths view
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Learning Path</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We've designed personalized Bitcoin education experiences for different generations and learning styles. 
          Choose the path that best fits your preferences and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pathsData && Object.values(pathsData).map((path) => (
          <Card key={path.id} className="bg-card border-muted/20 hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl ${path.color} text-white text-3xl group-hover:scale-110 transition-transform shadow-lg ring-2 ring-white/20 group-hover:ring-white/40`}>
                  {path.isGame ? <Gamepad2 className="h-8 w-8 drop-shadow-lg" /> : path.icon}
                </div>
                <Badge variant="outline" className="bg-background">
                  <Clock className="mr-1 h-3 w-3" />
                  {path.estimatedTime}
                </Badge>
              </div>
              <CardTitle className="text-xl mb-2">{path.title}</CardTitle>
              <CardDescription className="text-sm font-medium text-primary mb-2">
                {path.subtitle}
              </CardDescription>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {path.description}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {path.lessons && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      {path.lessons.length} lessons
                    </span>
                    <span className="text-muted-foreground">
                      <Users className="inline h-4 w-4 mr-1" />
                      {path.id.includes('boom') || path.id.includes('policy') ? 'Baby Boomers' : path.id.includes('millennial') || path.id.includes('escape') ? 'Millennials' : 'All Ages'}
                    </span>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={() => handlePathSelect(path.id)}
                >
                  {path.isGame ? (
                    <>
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Start Adventure
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Begin Learning
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-6 mt-8">
        <div className="text-center space-y-2">
          <TrendingUp className="h-8 w-8 mx-auto text-primary" />
          <h3 className="text-lg font-semibold">Not sure which path to choose?</h3>
          <p className="text-muted-foreground">
            Baby Boomers often prefer the structured, clear explanations, while Millennials enjoy interactive content. 
            The Dollar Dilemma game is perfect for understanding economic history and Bitcoin's role.
          </p>
        </div>
      </div>
    </div>
  );
}