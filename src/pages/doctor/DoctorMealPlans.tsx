import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Utensils, AlertCircle, Search, Eye } from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";

const DoctorMealPlans = () => {
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const templatesQuery = useQuery({
    queryKey: ["doctor-meal-templates", search],
    queryFn: () => doctorDashboardApi.mealTemplates(),
  });

  const templates = templatesQuery.data?.templates ?? [];

  const openPreview = (t: any) => {
    setSelectedTemplate(t);
    setShowPreview(true);
  };

  return (
    <DoctorLayout title="Meal Plans" subtitle="Browse and assign meal plan templates.">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {templatesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 bg-white shadow-sm">
              <CardContent className="p-5"><div className="h-40 animate-pulse rounded-lg bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      )}

      {templatesQuery.isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load meal templates</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => templatesQuery.refetch()}>Retry</Button>
        </div>
      )}

      {!templatesQuery.isLoading && !templatesQuery.isError && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Utensils className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No meal templates available</p>
          <p className="text-sm">Meal plan templates will appear here.</p>
        </div>
      )}

      {!templatesQuery.isLoading && !templatesQuery.isError && templates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t: any) => (
            <Card key={t.id} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-full bg-[#021B09]/10 p-2.5">
                    <Utensils className="h-4 w-4 text-[#021B09]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {t.duration && <Badge variant="outline">{t.duration}</Badge>}
                  {t.meals_count && <Badge variant="outline">{t.meals_count} meals</Badge>}
                </div>
                <Button variant="outline" size="sm" className="rounded-full w-full" onClick={() => openPreview(t)}>
                  <Eye className="mr-1 h-3 w-3" /> View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name || "Meal Template"}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description || ""}</DialogDescription>
          </DialogHeader>
          {selectedTemplate?.meals && selectedTemplate.meals.length > 0 ? (
            <div className="space-y-3">
              {selectedTemplate.meals.map((meal: any, idx: number) => (
                <div key={idx} className="rounded-xl bg-[#021B09]/5 p-3">
                  <p className="font-medium text-sm capitalize">{meal.meal_type || "Meal"}</p>
                  <p className="text-xs text-muted-foreground">{meal.title || meal.name || ""}</p>
                  {meal.calories && <p className="text-xs text-muted-foreground">{meal.calories} cal</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Utensils className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No meal details available for this template.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
};

export default DoctorMealPlans;