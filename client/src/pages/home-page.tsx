import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LearningPath } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, GraduationCap, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HomePage() {
  const { user } = useAuth();
  const [skill, setSkill] = useState("");

  const { data: paths, isLoading: isLoadingPaths } = useQuery<LearningPath[]>({
    queryKey: ["/api/paths"],
  });

  const generateMutation = useMutation({
    mutationFn: async (skill: string) => {
      const res = await apiRequest("POST", "/api/paths/generate", { skill });
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (path: Omit<LearningPath, "id" | "userId" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/paths", path);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paths"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/paths/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paths"] });
    },
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter a skill to learn..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
              <Button
                onClick={() => generateMutation.mutate(skill)}
                disabled={generateMutation.isPending || !skill}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            </div>

            {generateMutation.data && (
              <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-semibold">{generateMutation.data.title}</h2>
                <p className="text-muted-foreground">{generateMutation.data.description}</p>
                
                <Accordion type="single" collapsible className="w-full">
                  {generateMutation.data.steps.map((step, index) => (
                    <AccordionItem key={index} value={`step-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          {step.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <p>{step.description}</p>
                          <div className="space-y-2">
                            <h4 className="font-semibold">Resources:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {step.resources.map((resource, idx) => (
                                <li key={idx}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <Button
                  className="mt-4"
                  onClick={() => saveMutation.mutate(generateMutation.data)}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save Path"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Saved Paths</h2>
          {isLoadingPaths ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : paths?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved paths yet. Generate one above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paths?.map((path) => (
                <Card key={path.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{path.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(path.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{path.description}</p>
                    <Accordion type="single" collapsible className="w-full">
                      {path.steps.map((step: any, index: number) => (
                        <AccordionItem key={index} value={`step-${index}`}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              {step.title}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <p>{step.description}</p>
                              <div className="space-y-2">
                                <h4 className="font-semibold">Resources:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {step.resources.map((resource: string, idx: number) => (
                                    <li key={idx}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
