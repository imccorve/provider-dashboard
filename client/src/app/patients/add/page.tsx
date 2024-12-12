"use client";

import { useRouter } from "next/navigation";
import { NavigationBar } from "@/components/header";
import { useSWRConfig } from "swr";
import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackAlert } from "@/components/feedback-alert";
import { PatientForm, type PatientFormValues } from "@/components/patient-form";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AddPatient() {
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const { message, showSuccess, showError } = useFeedback();
  
    const { data: customFieldTemplates = [] } = useSWR(
      "http://localhost:8000/api/custom-field-templates/",
      fetcher
    );
  
    const handleSubmit = async (data: PatientFormValues) => {
      const validAddresses = data.addresses.filter(
        (addr) => addr.street || addr.city || addr.state || addr.zip_code
      );
  
      const dataToSubmit = {
        ...data,
        addresses: validAddresses,
        custom_fields: data.custom_fields
          .filter((field) => field.value.trim())
          .map((field) => ({
            template_id: field.template_id,
            value: field.value.trim(),
          })),
      };
  
      try {
        const response = await fetch("http://localhost:8000/api/patients/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSubmit),
        });
  
        if (response.ok) {
          showSuccess("Patient successfully added!");
          await mutate("http://localhost:8000/api/patients/");
        } else {
          const errorData = await response.json();
          showError(errorData.detail || "Failed to add patient");
        }
      } catch (error) {
        console.error("Error:", error);
        showError("Failed to add patient");
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>
  
          {message && <FeedbackAlert message={message} className="mb-6" />}
  
          <PatientForm
            customFieldTemplates={customFieldTemplates}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/")}
            submitButtonText="Create Patient"
            resetAfterSubmit={true}
          />
        </div>
      </div>
    );
  }