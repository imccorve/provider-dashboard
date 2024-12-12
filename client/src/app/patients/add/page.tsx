"use client";

import { useRouter } from "next/navigation";
import { NavigationBar } from "@/components/header";
import { Button } from "@/components/ui/button";
import { usePatientForm } from "@/hooks/usePatientForm";
import { PatientFormFields } from "@/components/patient-form-field";
import { useSWRConfig } from "swr";
import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackAlert } from "@/components/feedback-alert";

export default function AddPatient() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { message, showSuccess, showError } = useFeedback();

  const {
    formData,
    setFormData,
    customFieldTemplates,
    handleAddressChange,
    handlePrimaryChange,
    addAddress,
    removeAddress,
    resetForm,
  } = usePatientForm();

  const handleChange = (e) => {
    const { name, value, templateId } = e.target;

    if (name === "custom_fields") {
      handleCustomFieldChange(templateId, value);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (templateId, value) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: prev.custom_fields.map((field) =>
        field.template_id === templateId ? { ...field, value } : field
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validAddresses = formData.addresses.filter(
      (addr) => addr.street || addr.city || addr.state || addr.zip_code
    );

    const dataToSubmit = {
      ...formData,
      addresses: validAddresses,
      custom_fields: formData.custom_fields
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
        resetForm();
        showSuccess("Patient successfully added!");
        await mutate("http://localhost:8000/api/patients/");
      } else {
        showError("Failed to add patient");
      }
    } catch (error) {
      showError("Failed to add patient");
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
            handleAddressChange={handleAddressChange}
            handlePrimaryChange={handlePrimaryChange}
            addAddress={addAddress}
            removeAddress={removeAddress}
            customFieldTemplates={customFieldTemplates}
          />

          {message && <FeedbackAlert message={message} />}

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