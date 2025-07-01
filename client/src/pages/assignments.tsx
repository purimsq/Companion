import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FloatingAddButton from "@/components/floating-add-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, Trash2, CheckCircle, AlertTriangle, Target } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: "assignment" | "cat" | "exam";
  questions?: string;
  deadline: string;
  unitId?: number;
  completed: boolean;
  daysUntilDue: number;
  urgency: "high" | "medium" | "low";
}

interface Unit {
  id: number;
  name: string;
}

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["assignment", "cat", "exam"]),
  questions: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  unitId: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export default function Assignments() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"assignment" | "cat" | "exam">("assignment");
  const { toast } = useToast();

  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: units, isLoading: isUnitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const payload = {
        ...data,
        unitId: data.unitId ? parseInt(data.unitId) : undefined,
      };
      const response = await apiRequest("POST", "/api/assignments", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Assignment created",
        description: "Your assignment has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      await apiRequest("DELETE", `/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      await apiRequest("PATCH", `/api/assignments/${assignmentId}`, { completed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Assignment completed",
        description: "Great job! Assignment marked as completed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: selectedType,
      questions: "",
      deadline: "",
      unitId: "",
    },
  });

  // Update form when selectedType changes
  useEffect(() => {
    form.setValue("type", selectedType);
  }, [selectedType, form]);

  const onSubmit = (data: AssignmentFormData) => {
    createMutation.mutate(data);
  };

  const isLoading = isAssignmentsLoading || isUnitsLoading;

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
                  <div key={i} className="h-32 bg-warm-beige rounded-2xl"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high": return <AlertTriangle className="w-4 h-4" />;
      case "medium": return <Clock className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "assignment": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cat": return "bg-orange-100 text-orange-800 border-orange-200";
      case "exam": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const upcomingAssignments = assignments?.filter(a => !a.completed && a.daysUntilDue >= 0) || [];
  const overdueAssignments = assignments?.filter(a => !a.completed && a.daysUntilDue < 0) || [];
  const completedAssignments = assignments?.filter(a => a.completed) || [];

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-charcoal mb-2">Assignments, CATs & Exams</h1>
              <p className="text-soft-black/70">Track your assignments, continuous assessment tests, and exams</p>
            </div>
            <div className="flex gap-3">
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => { setSelectedType("assignment"); setIsCreateDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assignment
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => { setSelectedType("cat"); setIsCreateDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                CAT
              </Button>
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => { setSelectedType("exam"); setIsCreateDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Exam
              </Button>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New {selectedType === "cat" ? "CAT" : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</DialogTitle>
              </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Anatomy CAT 2" 
                              {...field} 
                              className="focus-warm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus-warm">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="assignment">Assignment</SelectItem>
                              <SelectItem value="cat">CAT (Continuous Assessment Test)</SelectItem>
                              <SelectItem value="exam">Exam</SelectItem>
                            </SelectContent>
                          </Select>
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description or topics covered..."
                              {...field}
                              className="focus-warm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field} 
                              className="focus-warm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Questions/Topics (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Paste assignment questions or list topics to cover..."
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
                        {createMutation.isPending ? "Creating..." : "Create Assignment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-8">
            {/* Overdue Section */}
            {overdueAssignments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-destructive mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Overdue ({overdueAssignments.length})
                </h2>
                <div className="space-y-4">
                  {overdueAssignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-white shadow-soft border-l-4 border-l-destructive">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-charcoal">{assignment.title}</h3>
                              <Badge variant="outline" className="uppercase text-xs">
                                {assignment.type}
                              </Badge>
                              <Badge variant="destructive">
                                {Math.abs(assignment.daysUntilDue)} days overdue
                              </Badge>
                            </div>
                            {assignment.description && (
                              <p className="text-soft-black/70 mb-3">{assignment.description}</p>
                            )}
                            <div className="flex items-center text-sm text-soft-black/60">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => completeMutation.mutate(assignment.id)}
                              className="bg-success-soft hover:bg-success-soft/80 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Complete
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(assignment.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Upcoming ({upcomingAssignments.length})
              </h2>
              {upcomingAssignments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => (
                    <Card key={assignment.id} className="card-hover bg-white shadow-soft border-0">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-charcoal">{assignment.title}</h3>
                              <Badge variant="outline" className="uppercase text-xs">
                                {assignment.type}
                              </Badge>
                              <Badge variant={getUrgencyColor(assignment.urgency)}>
                                <div className="flex items-center space-x-1">
                                  {getUrgencyIcon(assignment.urgency)}
                                  <span>
                                    {assignment.daysUntilDue === 0 ? "Due today" : `${assignment.daysUntilDue} days left`}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                            {assignment.description && (
                              <p className="text-soft-black/70 mb-3">{assignment.description}</p>
                            )}
                            <div className="flex items-center text-sm text-soft-black/60">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => completeMutation.mutate(assignment.id)}
                              className="bg-success-soft hover:bg-success-soft/80 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Complete
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(assignment.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white shadow-soft border-0">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Target className="w-16 h-16 text-soft-black/30 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No upcoming assignments</h3>
                    <p className="text-soft-black/60 text-center mb-6 max-w-md">
                      You're all caught up! Add new assignments as they come up to stay organized.
                    </p>
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-soft-golden hover:bg-warning-soft text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Assignment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Completed Section */}
            {completedAssignments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-soft" />
                  Completed ({completedAssignments.length})
                </h2>
                <div className="space-y-4">
                  {completedAssignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-warm-beige/30 shadow-soft border-0 opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-charcoal line-through">{assignment.title}</h3>
                              <Badge variant="outline" className="uppercase text-xs">
                                {assignment.type}
                              </Badge>
                              <Badge variant="default" className="bg-success-soft">
                                Completed
                              </Badge>
                            </div>
                            {assignment.description && (
                              <p className="text-soft-black/50 mb-3">{assignment.description}</p>
                            )}
                            <div className="flex items-center text-sm text-soft-black/50">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Was due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(assignment.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
