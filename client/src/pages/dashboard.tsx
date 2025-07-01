import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FloatingAddButton from "@/components/floating-add-button";
import { useLocation } from "wouter";
import { Calendar, Clock, CheckCircle, Flame, Target, BookOpen } from "lucide-react";

interface DashboardData {
  user: {
    name: string;
    pace: number;
  };
  todaysProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  studyStreak: number;
  nextSession?: {
    title: string;
    startTime: string;
    endTime: string;
    estimatedMinutes: number;
  };
  upcomingAssignments: Array<{
    id: number;
    title: string;
    description: string;
    deadline: string;
    daysUntilDue: number;
    urgency: "high" | "medium" | "low";
  }>;
}

interface Unit {
  id: number;
  name: string;
  description: string;
  color: string;
  documentsCount: number;
  completedTopics: number;
  totalTopics: number;
  progressPercentage: number;
  lastStudied: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: units, isLoading: isUnitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const isLoading = isDashboardLoading || isUnitsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <div className="ml-64 flex-1">
          <Header />
          <main className="p-8">
            <div className="space-y-6">
              {/* Loading skeletons */}
              <div className="animate-pulse">
                <div className="h-8 bg-warm-beige rounded-lg w-64 mb-4"></div>
                <div className="h-4 bg-warm-beige rounded w-48"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-warm-beige rounded-2xl"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8">
          {/* Welcome Section */}
          <div className="mb-8 slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-semibold text-charcoal mb-2">
                  Hey, {dashboardData?.user.name || 'Mitch'}! 👋
                </h2>
                <p className="text-soft-black/70">Ready for another productive study session?</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-soft-black/60">Today</p>
                <p className="text-lg font-medium text-charcoal">{formatDate()}</p>
              </div>
            </div>
          </div>

          {/* Study Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Today's Progress */}
            <Card className="card-hover bg-white shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Today's Progress</h3>
                  <div className="w-12 h-12 bg-success-soft/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success-soft" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-black/70">Completed Topics</span>
                    <span className="font-medium text-charcoal">
                      {dashboardData?.todaysProgress.completed || 0} of {dashboardData?.todaysProgress.total || 0}
                    </span>
                  </div>
                  <Progress 
                    value={dashboardData?.todaysProgress.percentage || 0} 
                    className="h-2 bg-warm-beige"
                  />
                  <p className="text-sm text-soft-black/60">Keep going! You're doing great.</p>
                </div>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="card-hover bg-white shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Study Streak</h3>
                  <div className="w-12 h-12 bg-soft-golden/20 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-soft-golden" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-charcoal mb-1">
                    {dashboardData?.studyStreak || 0}
                  </div>
                  <p className="text-sm text-soft-black/70">days in a row</p>
                  <p className="text-xs text-soft-black/60 mt-2">Amazing consistency!</p>
                </div>
              </CardContent>
            </Card>

            {/* Next Study Session */}
            <Card className="card-hover bg-white shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Up Next</h3>
                  <div className="w-12 h-12 bg-muted-sage/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-muted-sage" />
                  </div>
                </div>
                <div>
                  {dashboardData?.nextSession ? (
                    <>
                      <p className="font-medium text-charcoal mb-1">
                        {dashboardData.nextSession.title}
                      </p>
                      <p className="text-sm text-soft-black/70 mb-2">
                        {dashboardData.nextSession.startTime} - {dashboardData.nextSession.endTime}
                      </p>
                      <div className="flex items-center text-xs text-soft-black/60">
                        <Target className="w-4 h-4 mr-1" />
                        <span>Estimated {dashboardData.nextSession.estimatedMinutes} minutes</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-soft-black/60">No sessions scheduled</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setLocation("/study-plan")}
                      >
                        Create Plan
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Units */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-charcoal">Your Units</h3>
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/units")}
                className="text-soft-golden hover:text-warning-soft"
              >
                View all units
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units?.slice(0, 3).map((unit) => (
                <Card key={unit.id} className="card-hover bg-white shadow-soft border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-charcoal mb-2">{unit.name}</h4>
                        <p className="text-sm text-soft-black/70 mb-3">{unit.description}</p>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: unit.color }}
                      ></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-soft-black/70">Progress</span>
                        <span className="font-medium text-charcoal">
                          {unit.completedTopics} of {unit.totalTopics} topics
                        </span>
                      </div>
                      <Progress 
                        value={unit.progressPercentage} 
                        className="h-2 bg-warm-beige"
                      />
                      <div className="flex justify-between text-xs text-soft-black/60">
                        <span className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {unit.documentsCount} documents
                        </span>
                        <span>{unit.lastStudied}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-charcoal">Upcoming Assignments</h3>
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/assignments")}
                className="text-soft-golden hover:text-warning-soft"
              >
                View all assignments
              </Button>
            </div>
            
            <Card className="bg-white shadow-soft border-0">
              <CardContent className="p-6">
                {dashboardData?.upcomingAssignments && dashboardData.upcomingAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingAssignments.map((assignment) => (
                      <div 
                        key={assignment.id} 
                        className="flex items-center justify-between p-4 bg-warm-beige/50 rounded-xl"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal mb-1">{assignment.title}</h4>
                          <p className="text-sm text-soft-black/70">{assignment.description}</p>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <Badge variant={getUrgencyColor(assignment.urgency)}>
                            Due in {assignment.daysUntilDue} days
                          </Badge>
                          <div className="flex items-center text-xs text-soft-black/60">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(assignment.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-soft-black/60 mb-4">No upcoming assignments</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/assignments")}
                    >
                      Add Assignment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Study Tips & Motivation */}
          <Card className="gradient-warm shadow-soft border-0">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-soft-golden/20 rounded-xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-soft-golden" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-charcoal mb-2">Daily Motivation</h4>
                  <p className="text-soft-black/80 mb-3 italic font-serif-accent">
                    "The expert in anything was once a beginner. Every pro was once an amateur. Every icon was once an unknown."
                  </p>
                  <p className="text-sm text-soft-black/70">
                    You're making excellent progress, {dashboardData?.user.name || 'Mitch'}! Remember to take breaks and celebrate your achievements along the way.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <FloatingAddButton />
    </div>
  );
}
