import { useState } from 'react';

const initialFormState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    status: "INQUIRY",
    addresses: [{ street: "", city: "", state: "", zip_code: "", is_primary: true }],
  };

export function usePatientForm(initialData = null) {
    const [formData, setFormData] = useState(initialData || initialFormState);

  const resetForm = () => {
    setFormData({
      ...initialFormState,
    });
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = {
      ...newAddresses[index],
      [field]: value,
    };
    setFormData(prev => ({ ...prev, addresses: newAddresses }));
  };

  const handlePrimaryChange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        is_primary: i === index,
      })),
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { street: "", city: "", state: "", zip_code: "", is_primary: false },
      ],
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  return {
    formData,
    setFormData,
    handleAddressChange,
    handlePrimaryChange,
    addAddress,
    removeAddress,
    resetForm,
  };
}