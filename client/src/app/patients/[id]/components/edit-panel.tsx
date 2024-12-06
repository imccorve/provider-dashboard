"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePatientForm } from "@/hooks/usePatientForm";
import { PatientFormFields } from "@/components/patient-form-field";
import { useSWRConfig } from "swr";
import { Patient } from "@/types/patient";

interface EditPanelProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditPanel({
  patient,
  isOpen,
  onClose,
}: EditPanelProps) {
  const { mutate } = useSWRConfig();

  const {
    formData,
    setFormData,
  } = usePatientForm(patient);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev }));
  };

  const handleSave = async () => {
    if (!formData) return;

    const preparedData = {
      ...formData,
      created_at: undefined,
      updated_at: undefined,
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
        return;
      }

      await mutate(`http://localhost:8000/api/patients/`);
      await mutate(`http://localhost:8000/api/patients/${patient.id}/`);
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full h-full fixed top-0 right-0 sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Patient</SheetTitle>
        </SheetHeader>

        {formData && (
          <div className="mt-6 space-y-6">
            <PatientFormFields
              formData={formData}
              handleChange={handleChange}
              isEditMode={true}
            />

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}