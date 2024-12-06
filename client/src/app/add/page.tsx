"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePatientForm } from "@/hooks/usePatientForm";
import { PatientFormFields } from "@/components/patient-form-field";
import { useSWRConfig } from "swr";
import { NavigationBar } from "@/components/header";

export default function AddPatient() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const {
    formData,
    setFormData,
    resetForm,
  } = usePatientForm();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const dataToSubmit = {
      ...formData,
    };

    try {
      const response = await fetch("http://localhost:8000/api/patients/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        resetForm();
        await mutate("http://localhost:8000/api/patients/");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <PatientFormFields
            formData={formData}
            handleChange={handleChange}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
            <Button type="submit">Create Patient</Button>
          </div>
        </form>
      </div>
    </div>
  );
}