import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Code, 
  PlayCircle, 
  CheckCircle, 
  ChevronLeft, 
  Award,
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'code';
  duration: string;
  completed: boolean;
  content?: string;
  videoUrl?: string;
}

export interface CourseModuleProps {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  level: string;
  duration: string;
  coverImage: string;
  completed: number;
  onBack: () => void;
}

const LearningModule = ({
  id,
  title,
  description,
  lessons,
  level,
  duration,
  coverImage,
  completed,
  onBack
}: CourseModuleProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showingLesson, setShowingLesson] = useState(false);
  
  const currentLesson = lessons[currentLessonIndex];
  const progressPercentage = (completed / lessons.length) * 100;
  
  const handleStartCourse = () => {
    setCurrentLessonIndex(0);
    setShowingLesson(true);
    setActiveTab('content');
  };
  
  const handleContinueCourse = () => {
    // Start from the first incomplete lesson
    const nextLessonIndex = lessons.findIndex(lesson => !lesson.completed);
    setCurrentLessonIndex(nextLessonIndex >= 0 ? nextLessonIndex : 0);
    setShowingLesson(true);
    setActiveTab('content');
  };
  
  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };
  
  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      // End of course
      setShowingLesson(false);
      setActiveTab('overview');
    }
  };
  
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'reading':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      case 'code':
        return <Code className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  const getLessonStatusClass = (lesson: Lesson, index: number) => {
    if (lesson.completed) return "text-green-500 border-green-500 bg-green-500/10";
    if (index === currentLessonIndex && showingLesson) return "text-blue-500 border-blue-500 bg-blue-500/10";
    return "text-muted-foreground border-muted";
  };
  
  return (
    <Card className="bg-card shadow-md">
      <CardHeader className="pb-2 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 h-8 w-8 p-0"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="sm:w-2/3 mx-auto text-center pt-6">
          <Badge variant={
            level === "Beginner" ? "default" : 
            level === "Intermediate" ? "secondary" : 
            "outline"
          } className="mb-2">
            {level}
          </Badge>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
          
          <div className="flex justify-center space-x-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{lessons.length} Lessons</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1" />
              <span>Certificate</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {!showingLesson ? (
        <div className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-12 rounded-none bg-transparent p-0 gap-8">
                <TabsTrigger value="overview" className="h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="content" className="h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                  Lessons
                </TabsTrigger>
                <TabsTrigger value="resources" className="h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                  Resources
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About this course</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {description} This comprehensive course is designed to give you a solid foundation
                    in Bitcoin concepts, whether you're a complete beginner or looking to deepen your knowledge.
                    You'll learn through a mixture of videos, articles, interactive exercises, and quizzes.
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">What you'll learn</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Understand the fundamental concepts of Bitcoin and blockchain technology</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Learn how to securely store and manage your Bitcoin</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Analyze market trends and understand price movements</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Explore real-world use cases and applications of Bitcoin</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <div className="bg-muted/20 rounded-lg overflow-hidden">
                    <img 
                      src={coverImage}
                      alt={title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Your progress</span>
                          <span className="text-primary">{completed}/{lessons.length} lessons</span>
                        </div>
                        <Progress 
                          value={progressPercentage} 
                          className="h-2 bg-muted" 
                        />
                        
                        <Button 
                          className="w-full mt-4"
                          onClick={completed > 0 ? handleContinueCourse : handleStartCourse}
                        >
                          {completed > 0 ? "Continue Learning" : "Start Course"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Course Content</h3>
                  <div className="text-sm text-muted-foreground">
                    <span>{completed}/{lessons.length} completed</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {id === 'hodling-like-a-pro' ? (
                  <>
                    {/* Section 1: Introduction to Bitcoin */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Section 1: Introduction to Bitcoin</h4>
                      {lessons.slice(0, 3).map((lesson, lessonIndex) => {
                        const index = lessonIndex;
                        return (
                          <div 
                            key={lesson.id}
                            className={`p-3 border rounded-md flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors ${
                              lesson.completed ? 'border-green-500/50' : ''
                            } ${lessonIndex > 0 ? 'mt-2' : ''}`}
                            onClick={() => {
                              setCurrentLessonIndex(index);
                              setShowingLesson(true);
                            }}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-3 ${getLessonStatusClass(lesson, index)}`}>
                                {lesson.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  getLessonIcon(lesson.type)
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  {getLessonIcon(lesson.type)}
                                  <span className="ml-1 capitalize">{lesson.type}</span>
                                  <span className="mx-1">•</span>
                                  <Clock className="h-3 w-3" />
                                  <span className="ml-1">{lesson.duration}</span>
                                </div>
                              </div>
                            </div>
                            
                            {lesson.completed && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Completed
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Section 2: Bitcoin Transactions */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Section 2: Bitcoin Transactions</h4>
                      {lessons.slice(3, 6).map((lesson, lessonIndex) => {
                        const index = lessonIndex + 3;
                        return (
                          <div 
                            key={lesson.id}
                            className={`p-3 border rounded-md flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors ${
                              lesson.completed ? 'border-green-500/50' : ''
                            } ${lessonIndex > 0 ? 'mt-2' : ''}`}
                            onClick={() => {
                              setCurrentLessonIndex(index);
                              setShowingLesson(true);
                            }}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-3 ${getLessonStatusClass(lesson, index)}`}>
                                {lesson.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  getLessonIcon(lesson.type)
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  {getLessonIcon(lesson.type)}
                                  <span className="ml-1 capitalize">{lesson.type}</span>
                                  <span className="mx-1">•</span>
                                  <Clock className="h-3 w-3" />
                                  <span className="ml-1">{lesson.duration}</span>
                                </div>
                              </div>
                            </div>
                            
                            {lesson.completed && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Completed
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Section 3: Advanced Bitcoin Concepts */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Section 3: Advanced Bitcoin Concepts</h4>
                      {lessons.slice(6).map((lesson, lessonIndex) => {
                        const index = lessonIndex + 6;
                        return (
                          <div 
                            key={lesson.id}
                            className={`p-3 border rounded-md flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors ${
                              lesson.completed ? 'border-green-500/50' : ''
                            } ${lessonIndex > 0 ? 'mt-2' : ''}`}
                            onClick={() => {
                              setCurrentLessonIndex(index);
                              setShowingLesson(true);
                            }}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-3 ${getLessonStatusClass(lesson, index)}`}>
                                {lesson.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  getLessonIcon(lesson.type)
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  {getLessonIcon(lesson.type)}
                                  <span className="ml-1 capitalize">{lesson.type}</span>
                                  <span className="mx-1">•</span>
                                  <Clock className="h-3 w-3" />
                                  <span className="ml-1">{lesson.duration}</span>
                                </div>
                              </div>
                            </div>
                            
                            {lesson.completed && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Completed
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  // Regular course display for other courses
                  lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className={`p-3 border rounded-md flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors ${
                        lesson.completed ? 'border-green-500/50' : ''
                      }`}
                      onClick={() => {
                        setCurrentLessonIndex(index);
                        setShowingLesson(true);
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-3 ${getLessonStatusClass(lesson, index)}`}>
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            getLessonIcon(lesson.type)
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            {getLessonIcon(lesson.type)}
                            <span className="ml-1 capitalize">{lesson.type}</span>
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3" />
                            <span className="ml-1">{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      {lesson.completed && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Completed
                        </Badge>
                      )}
                    </div>
                  ))
                )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Resources</h3>
                <p className="text-muted-foreground">
                  Explore these curated resources to deepen your understanding of Bitcoin.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <ResourceCard 
                    title="Bitcoin Whitepaper" 
                    description="The original document by Satoshi Nakamoto that started it all."
                    icon={<FileText className="h-5 w-5 text-primary" />}
                  />
                  <ResourceCard 
                    title="GitHub Bitcoin Core" 
                    description="Explore the source code of the Bitcoin reference implementation."
                    icon={<Code className="h-5 w-5 text-primary" />}
                  />
                  <ResourceCard 
                    title="Bitcoin Developer Documentation" 
                    description="Technical documentation for developers building on Bitcoin."
                    icon={<BookOpen className="h-5 w-5 text-primary" />}
                  />
                  <ResourceCard 
                    title="Blockchain Explorer" 
                    description="Tool to visualize and explore the Bitcoin blockchain in real-time."
                    icon={<PlayCircle className="h-5 w-5 text-primary" />}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Lesson {currentLessonIndex + 1} of {lessons.length}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{currentLesson.type}</span>
                <span className="mx-2">•</span>
                <span>{currentLesson.duration}</span>
              </div>
              
              {currentLesson.completed && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Completed
                </Badge>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold">{currentLesson.title}</h2>
              
              {currentLesson.type === 'video' && (
                <div className="mt-4 aspect-video bg-black/90 rounded-lg overflow-hidden">
                  {currentLesson.videoUrl ? (
                    currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                      <div className="relative pt-[56.25%] w-full h-0">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
                          title={currentLesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PlayCircle className="h-16 w-16 text-primary/50 mx-auto" />
                        <p className="absolute bottom-4 text-muted-foreground">
                          Video URL: {currentLesson.videoUrl}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-6 h-full flex flex-col items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-primary/50 mx-auto" />
                      <p className="mt-4 text-muted-foreground">
                        Video not available
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {currentLesson.type === 'reading' && (
                <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                  {currentLesson.content ? (
                    <div className="space-y-4">
                      <p className="text-base leading-relaxed">{currentLesson.content}</p>
                      
                      {currentLesson.id.includes('hodl') ? (
                        <>
                          <h3 className="text-xl font-bold mt-6">Key Takeaways</h3>
                          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <ul className="space-y-2 list-none pl-0">
                              {currentLesson.id === 'hodl-4' && (
                                <>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Wallets store your keys, not your Bitcoin (it lives on the blockchain).</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Always verify wallet addresses—typos are a one-way ticket to pain.</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Hardware wallets = the GOAT for keeping your BTC safe.</span>
                                  </li>
                                </>
                              )}
                              
                              {currentLesson.id === 'hodl-5' && (
                                <>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Higher fees = faster confirmations (pay up or wait).</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Mempool's like a club with a bouncer—miners decide who gets in.</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Lightning Network's coming in clutch for cheap, fast payments.</span>
                                  </li>
                                </>
                              )}
                              
                              {currentLesson.id === 'hodl-8' && (
                                <>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Lightning = fast, cheap Bitcoin transactions.</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>It's still Bitcoin, just smarter.</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-primary mr-2">✓</span>
                                    <span>Adoption's growing, so get ahead of the curve.</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3>Key Concepts</h3>
                          <ul>
                            <li>Understanding the fundamental principles of Bitcoin</li>
                            <li>How blockchain maintains a secure, decentralized ledger</li>
                            <li>The role of miners in transaction validation</li>
                            <li>Cryptographic techniques ensuring Bitcoin's security</li>
                          </ul>
                          
                          <h3>Important Terminology</h3>
                          <ul>
                            <li><strong>Block:</strong> A collection of transactions bundled together</li>
                            <li><strong>Hash:</strong> A unique digital fingerprint for data</li>
                            <li><strong>Private Key:</strong> Secret code allowing you to spend your Bitcoin</li>
                            <li><strong>Public Key:</strong> Derived from private key, forms part of your Bitcoin address</li>
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <p>
                      This is a placeholder for reading content. In a real implementation, 
                      this would contain detailed educational material about Bitcoin concepts.
                      The content would include text, images, diagrams, and possibly embedded 
                      interactive elements.
                    </p>
                  )}
                </div>
              )}
              
              {currentLesson.type === 'quiz' && (
                <div className="mt-6 bg-muted/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Test Your Knowledge</h3>
                  
                  <div className="space-y-6">
                    {currentLesson.id === 'hodl-9' ? (
                      <>
                        <div className="space-y-2">
                          <p className="font-medium">1. What's the ultimate HODL strategy when markets are crashing?</p>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q1-a" name="hodl-q1" className="mr-2" />
                              <label htmlFor="hodl-q1-a">Panic sell everything, then FOMO back in later</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q1-b" name="hodl-q1" className="mr-2" />
                              <label htmlFor="hodl-q1-b">Delete your exchange apps and touch grass for a few years</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q1-c" name="hodl-q1" className="mr-2" />
                              <label htmlFor="hodl-q1-c">Leverage trade to recover losses quickly</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q1-d" name="hodl-q1" className="mr-2" />
                              <label htmlFor="hodl-q1-d">Constantly refresh price charts 24/7</label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium">2. Why is Bitcoin considered "digital gold"?</p>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q2-a" name="hodl-q2" className="mr-2" />
                              <label htmlFor="hodl-q2-a">Because it's yellow on most app icons</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q2-b" name="hodl-q2" className="mr-2" />
                              <label htmlFor="hodl-q2-b">Because it's scarce, portable, divisible, and not controlled by any government</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q2-c" name="hodl-q2" className="mr-2" />
                              <label htmlFor="hodl-q2-c">Because it's only used by rich people</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q2-d" name="hodl-q2" className="mr-2" />
                              <label htmlFor="hodl-q2-d">Because it's always going up in price</label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium">3. What's the best way to secure your Bitcoin?</p>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q3-a" name="hodl-q3" className="mr-2" />
                              <label htmlFor="hodl-q3-a">Write down your seed phrase and store in multiple secure locations</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q3-b" name="hodl-q3" className="mr-2" />
                              <label htmlFor="hodl-q3-b">Keep it all on exchanges – they have insurance</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q3-c" name="hodl-q3" className="mr-2" />
                              <label htmlFor="hodl-q3-c">Save your seed phrase as a note on your phone</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="hodl-q3-d" name="hodl-q3" className="mr-2" />
                              <label htmlFor="hodl-q3-d">Tell your roommate to remember it for you</label>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <p className="font-medium">1. What is the maximum supply of Bitcoin?</p>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input type="radio" id="q1-a" name="q1" className="mr-2" />
                              <label htmlFor="q1-a">10 million</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="q1-b" name="q1" className="mr-2" />
                              <label htmlFor="q1-b">21 million</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="q1-c" name="q1" className="mr-2" />
                              <label htmlFor="q1-c">100 million</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="q1-d" name="q1" className="mr-2" />
                              <label htmlFor="q1-d">Unlimited</label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium">2. What happens during a Bitcoin halving event?</p>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input type="radio" id="q2-a" name="q2" className="mr-2" />
                              <label htmlFor="q2-a">The price of Bitcoin is cut in half</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="q2-b" name="q2" className="mr-2" />
                              <label htmlFor="q2-b">The block size is reduced by 50%</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="q2-c" name="q2" className="mr-2" />
                              <label htmlFor="q2-c">The mining reward is reduced by 50%</label>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" id="q2-d" name="q2" className="mr-2" />
                              <label htmlFor="q2-d">The transaction fees are doubled</label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button className="mt-6">Submit Answers</Button>
                </div>
              )}
              
              {currentLesson.type === 'code' && (
                <div className="mt-6 space-y-4">
                  <div className="bg-black rounded-lg p-4 text-white font-mono text-sm overflow-x-auto">
                    <pre>{`// Example: A simple Bitcoin address validation function in JavaScript

function isValidBitcoinAddress(address) {
  // Bitcoin addresses are between 26-35 characters
  if (address.length < 26 || address.length > 35) {
    return false;
  }
  
  // Bitcoin addresses start with 1, 3, or bc1
  if (!address.match(/^(1|3|bc1)/)) {
    return false;
  }
  
  // Additional validation would check the checksum
  // and validate the base58 encoding
  
  return true;
}

// Test the function
const addresses = [
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Valid (Satoshi's address)
  '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // Valid
  'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', // Valid
  'invalidaddress123', // Invalid
];

addresses.forEach(addr => {
  console.log(\`\${addr} is \${isValidBitcoinAddress(addr) ? 'valid' : 'invalid'}\`);
});`}</pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Try it yourself:</h3>
                    <div className="border rounded-lg p-2 min-h-[200px] font-mono text-sm">
                      {/* This would be a code editor component in a real implementation */}
                      <p className="text-muted-foreground">// Write your code here...</p>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <Button variant="outline">Reset</Button>
                      <Button>Run Code</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handlePreviousLesson}
                disabled={currentLessonIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button onClick={handleNextLesson}>
                {currentLessonIndex === lessons.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const ResourceCard = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
  <Card className="bg-card flex items-start p-4 hover:bg-muted/20 transition-colors cursor-pointer">
    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  </Card>
);

export default LearningModule;