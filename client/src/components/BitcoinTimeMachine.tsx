import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Trophy, Target, Clock, AlertCircle, CheckCircle, XCircle, Zap } from "lucide-react";

interface GameLevel {
  id: number;
  title: string;
  story: string;
  data: {
    title: string;
    stats: Array<{
      label: string;
      value: string;
      note: string;
    }>;
  };
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    points: number;
  };
}

interface GameData {
  levels: GameLevel[];
}

interface BitcoinTimeMachineProps {
  gameData: GameData;
  onBack: () => void;
}

export function BitcoinTimeMachine({ gameData, onBack }: BitcoinTimeMachineProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const level = gameData.levels[currentLevel];
  const totalLevels = gameData.levels.length;
  const progressPercentage = ((currentLevel + 1) / totalLevels) * 100;
  const maxScore = totalLevels * 10;

  // Year mapping for visual timeline
  const timelineYears = ["2008", "2009", "2010", "2017", "2021", "2024"];
  const currentYear = timelineYears[currentLevel];

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === level.quiz.correct;
    setShowResult(true);
    
    if (isCorrect && !answeredQuestions.has(currentLevel)) {
      setKnowledgeScore(prev => prev + level.quiz.points);
      setAnsweredQuestions(prev => new Set(prev).add(currentLevel));
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < totalLevels - 1) {
      setCurrentLevel(currentLevel + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const handlePreviousLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setKnowledgeScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setAnsweredQuestions(new Set());
  };

  if (gameCompleted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Learning Paths
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-orange-50 border-2 border-purple-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="relative">
                <Clock className="h-16 w-16 text-purple-500 mx-auto" />
                <Zap className="h-6 w-6 text-orange-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
              Time Travel Complete!
            </CardTitle>
            <p className="text-muted-foreground">
              You've journeyed through Bitcoin's incredible 16-year evolution!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center space-x-4">
                <Badge variant="outline" className="text-lg px-4 py-2 border-purple-300">
                  <Trophy className="mr-2 h-5 w-5 text-purple-500" />
                  Knowledge Score: {knowledgeScore}/{maxScore}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2 border-orange-300">
                  <Target className="mr-2 h-5 w-5 text-orange-500" />
                  {Math.round((knowledgeScore / maxScore) * 100)}% Bitcoin Mastery
                </Badge>
              </div>
              
              <div className="bg-gradient-to-r from-purple-100 to-orange-100 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="font-semibold mb-3 text-purple-900">Your Bitcoin Journey Timeline:</h3>
                <div className="text-left space-y-2 text-sm text-gray-700">
                  <p>• <strong>2008:</strong> Witnessed Satoshi's whitepaper during financial crisis</p>
                  <p>• <strong>2009:</strong> Saw the Genesis Block creation with embedded bank bailout message</p>
                  <p>• <strong>2010:</strong> Experienced the first real-world Bitcoin transaction (Pizza Day)</p>
                  <p>• <strong>2017:</strong> Lived through the mainstream adoption and price mania</p>
                  <p>• <strong>2021:</strong> Observed institutional embrace and digital gold narrative</p>
                  <p>• <strong>2024:</strong> Understanding Bitcoin's maturation and future potential</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Key Insight:</h4>
                <p className="text-sm text-gray-700">
                  Bitcoin evolved from a response to financial crisis into digital property that offers scarcity, 
                  security, and sovereignty in an age of unlimited money printing. Its 16-year track record proves 
                  resilience against skeptics, regulations, and market cycles.
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={resetGame} variant="outline" className="border-purple-300 hover:bg-purple-50">
                <Clock className="mr-2 h-4 w-4" />
                Travel Again
              </Button>
              <Button onClick={onBack} className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600">
                Explore More Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning Paths
        </Button>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-purple-300">
            <Trophy className="mr-2 h-4 w-4 text-purple-500" />
            Knowledge: {knowledgeScore}/{maxScore}
          </Badge>
          <Badge variant="outline" className="border-orange-300">
            <Clock className="mr-2 h-4 w-4 text-orange-500" />
            Year: {currentYear}
          </Badge>
        </div>
      </div>

      {/* Timeline Visualization */}
      <Card className="bg-gradient-to-r from-purple-50 to-orange-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
              The Bitcoin Time Machine
            </CardTitle>
            <div className="text-right text-sm text-muted-foreground">
              <div>Timeline Progress: {Math.round(progressPercentage)}%</div>
              <Progress value={progressPercentage} className="w-32 h-2 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {timelineYears.map((year, index) => (
              <div key={year} className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  index <= currentLevel 
                    ? 'bg-purple-500 border-purple-500' 
                    : 'bg-gray-200 border-gray-300'
                }`} />
                <span className={`text-xs mt-1 ${
                  index === currentLevel ? 'font-bold text-purple-600' : 'text-muted-foreground'
                }`}>
                  {year}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-200 to-orange-200 rounded">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            {level.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-4 border border-purple-200">
            <p className="leading-relaxed text-gray-700">{level.story}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center text-orange-700">
              <Zap className="mr-2 h-4 w-4" />
              {level.data.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {level.data.stats.map((stat, index) => (
                <Card key={index} className="border-orange-200 bg-gradient-to-br from-orange-50 to-purple-50">
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-lg text-orange-600">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.note}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center text-purple-700">
              <AlertCircle className="mr-2 h-4 w-4" />
              Time Travel Quiz: {level.quiz.question}
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {level.quiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? showResult
                        ? index === level.quiz.correct
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-purple-500 bg-purple-50 text-purple-700'
                      : showResult && index === level.quiz.correct
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 bg-background'
                  }`}
                >
                  <div className="flex items-center">
                    {showResult && (
                      <div className="mr-3">
                        {index === level.quiz.correct ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : selectedAnswer === index ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  {selectedAnswer === level.quiz.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {selectedAnswer === level.quiz.correct ? 'Correct! Time travel mastery!' : 'Not quite right, but you\'re learning!'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{level.quiz.explanation}</p>
                    {selectedAnswer === level.quiz.correct && !answeredQuestions.has(currentLevel) && (
                      <Badge variant="outline" className="mt-2 border-purple-300">
                        <Zap className="mr-1 h-3 w-3" />
                        +{level.quiz.points} Knowledge Points
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousLevel}
              disabled={currentLevel === 0}
              className="border-purple-300 hover:bg-purple-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Era
            </Button>

            {!showResult ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswer === null}
                className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNextLevel}
                className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
              >
                {currentLevel < totalLevels - 1 ? (
                  <>
                    Next Era
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Complete Journey'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}