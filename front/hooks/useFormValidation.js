import { useState } from "react";

function useFormValidation(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    setErrors({ ...errors, [name]: validate(name, value) });
  };

  const isValid = Object.values(errors).every(e => !e);

  return { values, errors, handleChange, isValid, setValues, setErrors };
}

export default useFormValidation;