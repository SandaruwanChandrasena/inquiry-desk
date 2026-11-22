import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InquiryForm from '../components/InquiryForm.jsx'

function renderForm(onSubmit = vi.fn()) {
  render(<InquiryForm onSubmit={onSubmit} onCancel={vi.fn()} />)
  return onSubmit
}

async function fillRequiredFields(user) {
  await user.type(screen.getByLabelText(/customer name/i), 'Nimal')
  await user.type(screen.getByLabelText(/subject/i), 'Order late')
  await user.type(screen.getByLabelText(/description/i), 'Order 123 has not arrived')
}

describe('InquiryForm', () => {
  test('empty form shows errors and does not call onSubmit', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.click(screen.getByRole('button', { name: 'Save inquiry' }))

    expect(screen.getByText('Customer name is required')).toBeInTheDocument()
    expect(screen.getByText('Give an email or a phone number')).toBeInTheDocument()
    expect(screen.getByText('Subject is required')).toBeInTheDocument()
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('phone only is enough and sends the typed values', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn().mockResolvedValue())

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText(/phone/i), '0771234567')
    await user.click(screen.getByRole('button', { name: 'Save inquiry' }))

    expect(onSubmit).toHaveBeenCalledWith({
      customer_name: 'Nimal',
      email: '',
      phone: '0771234567',
      subject: 'Order late',
      description: 'Order 123 has not arrived',
    })
  })

  test('Save is disabled and shows "Saving..." while saving', async () => {
    const user = userEvent.setup()
    // A promise that never finishes = a save that is still waiting for the server
    renderForm(vi.fn(() => new Promise(() => {})))

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText(/email/i), 'nimal@example.com')
    await user.click(screen.getByRole('button', { name: 'Save inquiry' }))

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
  })

  test('save failed: shows the server message and keeps the typed values', async () => {
    const user = userEvent.setup()
    const serverError = new Error('Please fix the highlighted fields')
    serverError.fields = { email: 'Email is not valid' }
    renderForm(vi.fn().mockRejectedValue(serverError))

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText(/email/i), 'bad@email')
    await user.click(screen.getByRole('button', { name: 'Save inquiry' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please fix the highlighted fields')
    expect(screen.getByText('Email is not valid')).toBeInTheDocument()
    expect(screen.getByLabelText(/customer name/i)).toHaveValue('Nimal')
    expect(screen.getByRole('button', { name: 'Save inquiry' })).toBeEnabled()
  })
})