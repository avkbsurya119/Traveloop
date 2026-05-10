import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../../src/components/common/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders input element', () => {
    render(<Input label="Email" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Email" onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test@example.com' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Input label="Email" error="Invalid email" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-danger')
  })

  it('displays placeholder', () => {
    render(<Input label="Email" placeholder="Enter email" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
  })

  it('can be disabled', () => {
    render(<Input label="Email" disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('supports different types', () => {
    const { rerender } = render(<Input label="Password" type="password" />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')

    rerender(<Input label="Email" type="email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
  })
})
