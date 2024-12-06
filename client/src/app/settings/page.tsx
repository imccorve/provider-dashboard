"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { NavigationBar } from "@/components/header";
import { CustomFieldTemplate } from "@/types/patient";
import { useFeedback } from "@/hooks/useFeedback";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConfigureCustomFields() {
  const [editedFields, setEditedFields] = useState<CustomFieldTemplate[]>([]);

  const {
    data: customFields,
    error,
    mutate,
  } = useSWR<CustomFieldTemplate[]>(
    "http://localhost:8000/api/custom-field-templates/",
    fetcher
  );

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    if (customFields) {
      setEditedFields(customFields);
    }
  }, [customFields]);

  const addField = () => {
    const tempId = -Date.now(); // Use negative IDs for new unsaved fields
    setEditedFields([
      ...editedFields,
      {
        id: tempId,
        name: "",
        description: "",
        is_active: true,
      },
    ]);
  };

  const removeField = async (index: number) => {
    const fieldToRemove = editedFields[index];

    if (fieldToRemove.id > 0) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/custom-field-templates/${fieldToRemove.id}/`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove field");
        }

        await mutate(); // Refresh the data
      } catch (error) {
        console.log(error);
        return;
      }
    }

    setEditedFields(editedFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    field: keyof CustomFieldTemplate,
    value: string
  ) => {
    const updatedFields = [...editedFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setEditedFields(updatedFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validFields = editedFields.filter(
      (field) => field.name.trim() !== ""
    );

    try {
      for (const field of validFields) {
        const isNewField = field.id < 0;
        const method = isNewField ? "POST" : "PUT";

        const url = isNewField
          ? "http://localhost:8000/api/custom-field-templates/"
          : `http://localhost:8000/api/custom-field-templates/${field.id}/`;

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: field.name,
            description: field.description,
            is_active: field.is_active,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail || `Failed to save field: ${field.name}`
          );
        }
      }

      await mutate();
    } catch (error) {
      console.error("Error saving fields:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />

      <div className="max-w-3xl mx-auto p-6">
        {message && <FeedbackAlert message={message} />}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configure Custom Fields</h1>
          <Button onClick={addField}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {editedFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div>
                    <Label>Field Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        handleFieldChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Allergies, Previous Surgeries"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={field.description}
                      onChange={(e) =>
                        handleFieldChange(index, "description", e.target.value)
                      }
                      placeholder="Description of what this field is used for"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeField(index)}
                    className="text-red-600 hover:text-red-700 justify-start"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Remove Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {editedFields.length > 0 && (
            <Button type="submit" className="mt-4">
              Save Custom Fields
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}