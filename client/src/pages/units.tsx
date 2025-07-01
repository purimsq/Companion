import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { BookOpen, FileText, Plus, Trash2, Edit, Calendar } from "lucide-react";

interface Unit {
  id: number;
  name: string;
  description: string;
  color: string;
  documentsCount: number;
  notesCount: number;
  completedTopics: number;
  totalTopics: number;
  progressPercentage: number;
  lastStudied: string;
}

const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Please select a color"),
});

type UnitFormData = z.infer<typeof unitSchema>;

const colorOptions = [
  { value: "#8FBC8F", label: "Success Green", class: "bg-green-400" },
  { value: "#DAA520", label: "Warning Gold", class: "bg-yellow-500" },
  { value: "#B8B8B8", label: "Neutral Gray", class: "bg-gray-400" },
  { value: "#87CEEB", label: "Sky Blue", class: "bg-blue-400" },
  { value: "#DDA0DD", label: "Plum Purple", class: "bg-purple-400" },
  { value: "#F0A8A8", label: "Soft Pink", class: "bg-pink-400" },
];

export default function Units() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: UnitFormData) => {
      const response = await apiRequest("POST", "/api/units", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Unit created",
        description: "Your new study unit has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create unit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (unitId: number) => {
      await apiRequest("DELETE", `/api/units/${unitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Unit deleted",
        description: "The unit has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete unit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
    },
  });

  const onSubmit = (data: UnitFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <div className="ml-64 flex-1">
          <Header />
          <main className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-warm-beige rounded-lg w-48 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-warm-beige rounded-2xl"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-charcoal mb-2">Study Units</h1>
              <p className="text-soft-black/70">Organize your study materials by subject</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-soft-golden hover:bg-warning-soft text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Study Unit</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Anatomy" 
                              {...field} 
                              className="focus-warm"
                            />
                          </FormControl>
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
                              placeholder="Brief description of this unit..."
                              {...field}
                              className="focus-warm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Theme</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus-warm">
                                <SelectValue placeholder="Choose a color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colorOptions.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                                    <span>{color.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        {createMutation.isPending ? "Creating..." : "Create Unit"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {units && units.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((unit) => (
                <Card key={unit.id} className="card-hover bg-white shadow-soft border-0 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-charcoal mb-2">
                          {unit.name}
                        </CardTitle>
                        <p className="text-sm text-soft-black/70">{unit.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: unit.color }}
                        ></div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Unit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{unit.name}"? This action cannot be undone and will also delete all associated documents and notes.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(unit.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center text-soft-black/60">
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span>{unit.documentsCount} documents</span>
                      </div>
                      <div className="flex items-center text-soft-black/60">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>{unit.notesCount} notes</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-warm-beige">
                      <div className="flex items-center text-xs text-soft-black/60">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{unit.lastStudied}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={unit.progressPercentage > 75 ? "default" : unit.progressPercentage > 25 ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {unit.progressPercentage > 75 ? "Almost Done" : 
                           unit.progressPercentage > 25 ? "In Progress" : "Getting Started"}
                        </Badge>
                        <Button 
                          size="sm" 
                          className="bg-soft-golden hover:bg-warning-soft text-white text-xs h-6 px-2"
                          onClick={() => {/* TODO: Open upload modal for this specific unit */}}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white shadow-soft border-0">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="w-16 h-16 text-soft-black/30 mb-4" />
                <h3 className="text-lg font-medium text-charcoal mb-2">No study units yet</h3>
                <p className="text-soft-black/60 text-center mb-6 max-w-md">
                  Create your first study unit to organize your materials and track your progress.
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-soft-golden hover:bg-warning-soft text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Unit
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      <FloatingAddButton />
    </div>
  );
}
