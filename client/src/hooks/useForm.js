import { useCallback, useRef, useState } from 'react';
import { validateForm } from '../lib/validators.js';
import { ApiError } from '../lib/api.js';

/**
 * Hook quản lý form nhỏ gọn:
 * - Kiểm tra từng ô khi rời ô (blur); sau lần submit đầu tiên thì kiểm tra ngay khi gõ
 * - Submit lỗi → focus vào ô lỗi đầu tiên
 * - Gộp lỗi từ server (fields) vào từng ô; lỗi chung → formError
 */
export function useForm(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const refs = useRef({});

  const validateField = useCallback(
    (name, nextValues) => {
      if (!schema[name]) return;
      const msg = schema[name](nextValues[name] ?? '', nextValues);
      setErrors((e) => ({ ...e, [name]: msg }));
    },
    [schema]
  );

  /** Gắn vào input: <Field {...register('email')} /> */
  const register = (name) => ({
    name,
    ref: (el) => { refs.current[name] = el; },
    value: values[name] ?? '',
    error: errors[name],
    onChange: (e) => {
      const next = { ...values, [name]: e.target.value };
      setValues(next);
      if (submitted || errors[name]) validateField(name, next);
      if (formError) setFormError('');
    },
    onBlur: (e) => {
      if (e.target.value) validateField(name, values);
    },
  });

  const focusFirstError = (errs) => {
    const first = Object.keys(schema).find((k) => errs[k]) ?? Object.keys(errs)[0];
    refs.current[first]?.focus();
  };

  /** handleSubmit(async (values) => {...}) */
  const handleSubmit = (onValid) => async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    const errs = validateForm(values, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);

    setSubmitting(true);
    setFormError('');
    try {
      await onValid(values);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setErrors((prev) => ({ ...prev, ...err.fields }));
        focusFirstError(err.fields);
        if (!Object.keys(err.fields).some((k) => k in schema)) setFormError(err.message);
      } else {
        setFormError(err?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, errors, formError, setFormError, submitting, register, handleSubmit };
}
