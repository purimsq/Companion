import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FloatingAddButton from "@/components/floating-add-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, CheckCircle, Target, BookOpen, Brain, Coffee } from "lucide-react";

interface StudyPlanEntry {
  id: number;
  title: string;
  description?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  unitId?: number;
  documentId?: number;
  completed: boolean;
  createdAt: string;
}

interface Unit {
  id: number;
  name: string;
}

const studyPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  estimatedMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  unitId: z.string().optional(),
});

type StudyPlanFormData = z.infer<typeof studyPlanSchema>;

export default function StudyPlan() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const { data: studyPlan, isLoading: isPlanLoading } = useQuery<StudyPlanEntry[]>({
    queryKey: ["/api/study-plan", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/study-plan?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch study plan");
      return response.json();
    },
  });

  const { data: units, isLoading: isUnitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: StudyPlanFormData) => {
      const payload = {
        ...data,
        unitId: data.unitId ? parseInt(data.unitId) : undefined,
        estimatedMinutes: parseInt(data.estimatedMinutes.toString()),
      };
      const response = await apiRequest("POST", "/api/study-plan", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-plan"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Study session added",
        description: "Your study session has been scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create study session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (entryId: number) => {
      await apiRequest("PATCH", `/api/study-plan/${entryId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-plan"] });
      toast({
        title: "Session completed",
        description: "Great work! Study session marked as completed.",
        className: "confetti",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<StudyPlanFormData>({
    resolver: zodResolver(studyPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledDate: selectedDate,
      startTime: "",
      endTime: "",
      estimatedMinutes: 60,
      unitId: "",
    },
  });

  const onSubmit = (data: StudyPlanFormData) => {
    createMutation.mutate(data);
  };

  const isLoading = isPlanLoading || isUnitsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <div className="ml-64 flex-1">
          <Header />
          <main className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-warm-beige rounded-lg w-48 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-warm-beige rounded-2xl"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const todaysEntries = studyPlan?.filter(entry => entry.scheduledDate.split('T')[0] === selectedDate) || [];
  const completedToday = todaysEntries.filter(entry => entry.completed).length;
  const totalToday = todaysEntries.length;
  const progressPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const upcomingEntries = todaysEntries
    .filter(entry => !entry.completed)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedEntries = todaysEntries
    .filter(entry => entry.completed)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-charcoal mb-2">Daily Study Plan</h1>
              <p className="text-soft-black/70">Plan and track your study sessions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-soft-black/60" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto focus-warm"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-soft-golden hover:bg-warning-soft text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Study Session</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Review Anatomy Chapter 3" 
                                {...field} 
                                className="focus-warm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unitId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="focus-warm">
                                  <SelectValue placeholder="Select a unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No specific unit</SelectItem>
                                {units?.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field} 
                                className="focus-warm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time"
                                  {...field} 
                                  className="focus-warm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time"
                                  {...field} 
                                  className="focus-warm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What will you study in this session?"
                                {...field}
                                className="focus-warm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-soft-golden hover:bg-warning-soft text-white"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? "Scheduling..." : "Schedule Session"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Daily Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Today's Progress</h3>
                  <div className="w-12 h-12 bg-success-soft/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-success-soft" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-charcoal mb-1">{progressPercentage}%</div>
                  <p className="text-sm text-soft-black/70">{completedToday} of {totalToday} sessions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Study Time</h3>
                  <div className="w-12 h-12 bg-soft-golden/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-soft-golden" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-charcoal mb-1">
                    {Math.round(todaysEntries.reduce((acc, entry) => acc + entry.estimatedMinutes, 0) / 60 * 10) / 10}h
                  </div>
                  <p className="text-sm text-soft-black/70">planned for today</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Focus Sessions</h3>
                  <div className="w-12 h-12 bg-muted-sage/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-muted-sage" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-charcoal mb-1">{totalToday}</div>
                  <p className="text-sm text-soft-black/70">sessions scheduled</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="completed">Completed Today</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingEntries.length > 0 ? (
                upcomingEntries.map((entry) => (
                  <Card key={entry.id} className="card-hover bg-white shadow-soft border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-charcoal">{entry.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {entry.estimatedMinutes} min
                            </Badge>
                          </div>
                          {entry.description && (
                            <p className="text-soft-black/70 mb-3">{entry.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-soft-black/60">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{entry.startTime} - {entry.endTime}</span>
                            </div>
                            {entry.unitId && (
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                <span>{units?.find(u => u.id === entry.unitId)?.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => completeMutation.mutate(entry.id)}
                          className="bg-success-soft hover:bg-success-soft/80 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white shadow-soft border-0">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Calendar className="w-16 h-16 text-soft-black/30 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No upcoming sessions</h3>
                    <p className="text-soft-black/60 text-center mb-6 max-w-md">
                      Schedule your study sessions to stay organized and focused.
                    </p>
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-soft-golden hover:bg-warning-soft text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedEntries.length > 0 ? (
                completedEntries.map((entry) => (
                  <Card key={entry.id} className="bg-warm-beige/30 shadow-soft border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-charcoal">{entry.title}</h3>
                            <Badge variant="default" className="bg-success-soft text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {entry.estimatedMinutes} min
                            </Badge>
                          </div>
                          {entry.description && (
                            <p className="text-soft-black/60 mb-3">{entry.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-soft-black/50">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{entry.startTime} - {entry.endTime}</span>
                            </div>
                            {entry.unitId && (
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                <span>{units?.find(u => u.id === entry.unitId)?.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white shadow-soft border-0">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Coffee className="w-16 h-16 text-soft-black/30 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No completed sessions yet</h3>
                    <p className="text-soft-black/60 text-center max-w-md">
                      Complete your scheduled study sessions and they'll appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <FloatingAddButton />
    </div>
  );
}
