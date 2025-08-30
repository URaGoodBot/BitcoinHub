import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, ShoppingCart, User, MapPin, Coins, Award, BookOpen } from "lucide-react";

interface GameChapter {
  id: number;
  title: string;
  setting: string;
  description: string;
  objective: string;
  completed: boolean;
  analogy: string;
}

const gameChapters: GameChapter[] = [
  {
    id: 1,
    title: "The Mystery of Satoshi",
    setting: "Coffee Stall at Farmers' Market",
    description: "Meet Sam, your tech-savvy neighbor, and learn about Satoshi Nakamoto, the mysterious creator of Bitcoin and the 2008 white paper.",
    objective: "Understand Bitcoin's origins and the double-spend problem solution",
    completed: false,
    analogy: "Bitcoin is like 'digital gold' — limited, valuable, and not controlled by a bank."
  },
  {
    id: 2,
    title: "The Rise of Bitcoin",
    setting: "Fruit Stall Accepting Bitcoin",
    description: "Explore Bitcoin's early days from 2009-2020, including the genesis block and the 2017 bull run. Learn about mining and scarcity.",
    objective: "Complete a mining puzzle and make your first Bitcoin purchase",
    completed: false,
    analogy: "Bitcoin mining is like solving a puzzle to unlock a safe, with only so many safes available."
  },
  {
    id: 3,
    title: "Operation Chokepoint 2.0",
    setting: "Newsstand with Headlines",
    description: "Understand the 2023 regulatory crackdown on crypto-friendly banks like Silvergate and Signature, and how it affected the industry.",
    objective: "Navigate regulatory challenges and learn about crypto resilience",
    completed: false,
    analogy: "Banks closing crypto accounts is like a store refusing your cash because they don't like where you shop."
  },
  {
    id: 4,
    title: "The FTX Fallout",
    setting: "Vendor Selling Crypto News",
    description: "Learn about the 2022 FTX collapse, Sam Bankman-Fried's fraud, and important lessons about due diligence and risk management.",
    objective: "Pass the FTX knowledge quiz and earn risk awareness badge",
    completed: false,
    analogy: "FTX is like a bank that lent out your savings without telling you, then went bankrupt."
  },
  {
    id: 5,
    title: "Stablecoins at the Market",
    setting: "Vegetable Stall Accepting Stablecoins",
    description: "Discover stablecoins like USDT and their role in reducing volatility. Practice using them for everyday purchases.",
    objective: "Successfully complete a stablecoin transaction",
    completed: false,
    analogy: "Stablecoins are like gift cards — they hold steady value and can be used anywhere that accepts them."
  },
  {
    id: 6,
    title: "The Future of Bitcoin",
    setting: "Community Board with Predictions",
    description: "Explore Bitcoin's potential as a global reserve asset, corporate adoption, and predictions about replacing traditional currency.",
    objective: "Complete investment simulation and unlock Bitcoin Visionary title",
    completed: false,
    analogy: "Bitcoin is like planting a tree today that grows into a forest for future generations."
  }
];

interface BitcoinQuestGameProps {
  onBack: () => void;
}

export function BitcoinQuestGame({ onBack }: BitcoinQuestGameProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapters, setChapters] = useState(gameChapters);
  const [playerSats, setPlayerSats] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showChapterDetails, setShowChapterDetails] = useState(false);

  const currentChapterData = chapters[currentChapter];
  const progress = ((chapters.filter(c => c.completed).length) / chapters.length) * 100;

  const completeChapter = () => {
    const updatedChapters = [...chapters];
    updatedChapters[currentChapter] = { ...updatedChapters[currentChapter], completed: true };
    setChapters(updatedChapters);
    setPlayerSats(prev => prev + 1000); // Award 1000 sats per chapter
    
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setShowChapterDetails(false);
    }
  };

  const resetGame = () => {
    setChapters(gameChapters.map(c => ({ ...c, completed: false })));
    setCurrentChapter(0);
    setPlayerSats(0);
    setGameStarted(false);
    setShowChapterDetails(false);
  };

  if (!gameStarted) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Learning Hub
          </Button>
        </div>

        <Card className="mb-6 border-2 border-orange-200">
          <CardHeader className="bg-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <ShoppingCart className="mr-3 h-8 w-8" />
                  Bitcoin Quest: Rise to Riches
                </CardTitle>
                <p className="text-orange-100 mt-2">
                  An Educational Adventure for Boomers
                </p>
              </div>
              <Badge variant="secondary" className="bg-white text-orange-600 px-4 py-2 text-lg">
                6 Chapters
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-orange-500" />
                  Meet Pat - Your Character
                </h3>
                <p className="text-muted-foreground mb-4">
                  You're Pat, a retiree in a small town in 2025, curious about Bitcoin after 
                  hearing vendors at the local farmers' market accept it. Your tech-savvy 
                  neighbor Sam will guide you through Bitcoin's fascinating history.
                </p>
                <h4 className="font-semibold mb-2 flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                  Setting: Small Town Farmers' Market
                </h4>
                <p className="text-sm text-muted-foreground">
                  Navigate a friendly 2D farmers' market environment with clickable stalls, 
                  characters, and historical flashbacks to learn about Bitcoin's evolution.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-orange-500" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Satoshi Nakamoto</strong> - Bitcoin's mysterious creator</li>
                  <li>• <strong>Bitcoin Origins</strong> - The genesis block and early days</li>
                  <li>• <strong>Operation Chokepoint 2.0</strong> - Regulatory challenges</li>
                  <li>• <strong>FTX Collapse</strong> - Lessons in risk management</li>
                  <li>• <strong>Stablecoins</strong> - Practical crypto for daily use</li>
                  <li>• <strong>Bitcoin's Future</strong> - Corporate adoption and beyond</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Game Features:</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-orange-700">
                <div>• Point-and-click exploration</div>
                <div>• Choice-based narrative</div>
                <div>• Mini-games and puzzles</div>
                <div>• Simple, relatable analogies</div>
                <div>• Forgiving learning mechanics</div>
                <div>• Earn Sats for progress</div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setGameStarted(true)} 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                Start Your Bitcoin Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showChapterDetails) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => setShowChapterDetails(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chapter List
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-orange-600">
              <Coins className="mr-1 h-4 w-4" />
              <span className="font-semibold">{playerSats.toLocaleString()} Sats</span>
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        </div>

        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle className="text-xl">
              Chapter {currentChapterData.id}: {currentChapterData.title}
            </CardTitle>
            <p className="text-orange-100">{currentChapterData.setting}</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Chapter Description</h3>
                <p className="text-muted-foreground">{currentChapterData.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Your Objective</h3>
                <p className="text-muted-foreground">{currentChapterData.objective}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Key Analogy:</h4>
                <p className="text-orange-700 italic">"{currentChapterData.analogy}"</p>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={completeChapter}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                  disabled={currentChapterData.completed}
                >
                  {currentChapterData.completed ? (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Chapter Completed!
                    </>
                  ) : (
                    <>
                      Complete Chapter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedChapters = chapters.filter(c => c.completed).length;
  const allCompleted = completedChapters === chapters.length;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning Hub
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-orange-600">
            <Coins className="mr-1 h-4 w-4" />
            <span className="font-semibold">{playerSats.toLocaleString()} Sats</span>
          </div>
          <Progress value={progress} className="w-32" />
          <span className="text-sm text-muted-foreground">
            {completedChapters}/{chapters.length} chapters
          </span>
        </div>
      </div>

      <Card className="mb-6 border-2 border-orange-200">
        <CardHeader className="bg-orange-500 text-white">
          <CardTitle className="text-2xl flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6" />
            Bitcoin Quest: Rise to Riches
          </CardTitle>
          <p className="text-orange-100">
            Your Journey Through Bitcoin's History at the Farmers' Market
          </p>
        </CardHeader>
      </Card>

      {allCompleted && (
        <Card className="mb-6 border-2 border-green-200">
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Congratulations! Bitcoin Quest Completed!
            </h3>
            <p className="text-green-700 mb-4">
              You've earned the "Bitcoin Visionary" title and {playerSats.toLocaleString()} Sats!
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You now understand Bitcoin's journey from Satoshi's vision to its modern applications. 
              Your knowledge journal is complete with insights about Bitcoin's past, present, and future.
            </p>
            <Button onClick={resetGame} variant="outline" className="mr-2">
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold mb-4">Chapter Progress</h2>
        {chapters.map((chapter, index) => (
          <Card 
            key={chapter.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              chapter.completed ? 'border-green-200 bg-green-50' : 
              index === currentChapter ? 'border-orange-200 bg-orange-50' : ''
            }`}
            onClick={() => {
              setCurrentChapter(index);
              setShowChapterDetails(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground mr-2">
                      Chapter {chapter.id}
                    </span>
                    {chapter.completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Award className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                    {index === currentChapter && !chapter.completed && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Current Chapter
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{chapter.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{chapter.setting}</p>
                  <p className="text-sm text-muted-foreground">{chapter.objective}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}