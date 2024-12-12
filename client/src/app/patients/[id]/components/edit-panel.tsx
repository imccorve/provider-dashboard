"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSWRConfig } from "swr";
import { Patient } from "@/types/patient";
import { PatientForm, PatientFormValues } from "@/components/patient-form";

interface EditPanelProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  customFieldTemplates: any[];
}

export default function EditPanel({
  patient,
  isOpen,
  onClose,
  customFieldTemplates = [],
}: EditPanelProps) {
    console.log("EditPanel ");
  const { mutate } = useSWRConfig();

  const handleSubmit = async (data: PatientFormValues) => {
    console.log("EditPanel handleSubmit called with:", data);
    const preparedData = {
      ...data,
      created_at: undefined,
      updated_at: undefined,
      custom_fields: data.custom_fields
        .filter((field) => field.value.trim())
        .map((field) => ({
          template_id: field.template_id,
          value: field.value.trim(),
        })),
    };

    try {
      const response = await fetch(
        `http://localhost:8000/api/patients/${patient.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preparedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error details:", errorData);
        throw new Error("Failed to save patient");
      }

      await mutate(`http://localhost:8000/api/patients/`);
      await mutate(`http://localhost:8000/api/patients/${patient.id}/`);
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
      throw error; // Re-throw to let the form component know there was an error
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full h-full fixed top-0 right-0 sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Patient</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <PatientForm
            initialData={{
              ...patient,
              date_of_birth: patient.date_of_birth.split('T')[0],
              custom_fields: patient.custom_fields.map(field => ({
                template_id: field.template_id,
                value: field.value
              }))
            }}
            customFieldTemplates={customFieldTemplates}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isEditMode={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}