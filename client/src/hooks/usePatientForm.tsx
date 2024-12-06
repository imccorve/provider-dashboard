import { useState } from 'react';

const initialFormState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    status: "INQUIRY",
  };

export function usePatientForm(initialData = null) {
    const [formData, setFormData] = useState(initialData || initialFormState);

  const resetForm = () => {
    setFormData({
      ...initialFormState,
    });
  };

  return {
    formData,
    setFormData,
    resetForm,
  };
}