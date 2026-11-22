import { useState } from 'react'
import { CheckIcon, FileIcon, MailIcon, PhoneIcon, UserIcon } from './Icons.jsx'

const EMPTY_FORM = { customer_name: '', email: '', phone: '', subject: '', description: '' }

// Quick checks in the browser to guide the user. The API checks everything again.
function validate(values) {
  const errors = {}
  if (!values.customer_name.trim()) errors.customer_name = 'Customer name is required'
  if (!values.email.trim() && !values.phone.trim())
    errors.contact = 'Give an email or a phone number'
  if (!values.subject.trim()) errors.subject = 'Subject is required'
  if (!values.description.trim()) errors.description = 'Description is required'
  return errors
}

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  )
}

function Required() {
  return <span className="text-red-600"> *</span>
}

const iconClass =
  'pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400'

function InquiryForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))

    // Hide the old error for this field once the user starts fixing it
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      if (name === 'email' || name === 'phone') delete next.contact
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const errors = validate(values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setFieldErrors(err.fields ?? {})
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const contactError = fieldErrors.contact

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="customer_name" className="label">
          Customer name
          <Required />
        </label>
        <div className="relative">
          <UserIcon className={iconClass} />
          <input
            id="customer_name"
            name="customer_name"
            placeholder="Enter customer name"
            className="input pl-9"
            value={values.customer_name}
            onChange={handleChange}
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.customer_name)}
            aria-describedby="customer_name-error"
          />
        </div>
        <FieldError id="customer_name-error" message={fieldErrors.customer_name} />
      </div>

      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="relative">
              <MailIcon className={iconClass} />
              <input
                id="email"
                name="email"
                placeholder="Enter email address"
                type="email"
                className="input pl-9"
                value={values.email}
                onChange={handleChange}
                maxLength={255}
                aria-invalid={Boolean(fieldErrors.email || contactError)}
                aria-describedby="email-error contact-error"
              />
            </div>
            <FieldError id="email-error" message={fieldErrors.email} />
          </div>

          <div>
            <label htmlFor="phone" className="label">
              Phone
            </label>
            <div className="relative">
              <PhoneIcon className={iconClass} />
              <input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                type="tel"
                className="input pl-9"
                value={values.phone}
                onChange={handleChange}
                maxLength={30}
                aria-invalid={Boolean(fieldErrors.phone || contactError)}
                aria-describedby="phone-error contact-error"
              />
            </div>
            <FieldError id="phone-error" message={fieldErrors.phone} />
          </div>
        </div>
        {contactError ? (
          <FieldError id="contact-error" message={contactError} />
        ) : (
          <p className="mt-1 text-xs text-stone-500">Give at least one: email or phone.</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="label">
          Subject
          <Required />
        </label>
        <div className="relative">
          <FileIcon className={iconClass} />
          <input
            id="subject"
            name="subject"
            placeholder="Enter inquiry subject"
            className="input pl-9"
            value={values.subject}
            onChange={handleChange}
            maxLength={150}
            aria-invalid={Boolean(fieldErrors.subject)}
            aria-describedby="subject-error"
          />
        </div>
        <FieldError id="subject-error" message={fieldErrors.subject} />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
          <Required />
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter inquiry details..."
          rows={4}
          className="input"
          value={values.description}
          onChange={handleChange}
          maxLength={2000}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby="description-error"
        />
        <FieldError id="description-error" message={fieldErrors.description} />
      </div>

      {formError && (
        <p role="alert" className="alert-error">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {!saving && <CheckIcon className="mr-1.5 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save inquiry'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default InquiryForm