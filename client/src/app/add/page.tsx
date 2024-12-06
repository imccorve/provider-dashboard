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
    handleAddressChange,
    handlePrimaryChange,
    addAddress,
    removeAddress,
    customFieldTemplates,
  } = usePatientForm();


  const handleCustomFieldChange = (templateId, value) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: prev.custom_fields.map((field) =>
        field.template_id === templateId ? { ...field, value } : field
      ),
    }));
  };

  const handleChange = (e) => {
    const { name, value, templateId } = e.target;

    if (name === "custom_fields") {
      handleCustomFieldChange(templateId, value);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
            handleAddressChange={handleAddressChange}
            handlePrimaryChange={handlePrimaryChange}
            addAddress={addAddress}
            removeAddress={removeAddress}
            customFieldTemplates={customFieldTemplates}
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