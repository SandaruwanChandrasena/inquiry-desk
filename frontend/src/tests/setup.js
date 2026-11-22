import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Remove what each test rendered, so tests don't affect each other
afterEach(() => {
  cleanup()
})