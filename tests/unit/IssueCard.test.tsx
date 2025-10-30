import { render, screen } from '@testing-library/react'
import IssueCard from '../../src/components/IssueCard'
import type { Issue } from '../../src/types'

// Mock the store
jest.mock('../../src/store', () => ({
  useFCStore: () => ({
    updateIssue: jest.fn(),
    updateIssueStatus: jest.fn(),
    deleteIssue: jest.fn(),
    assignIssueToSprint: jest.fn(),
    sprints: []
  })
}))

// Mock the services
jest.mock('../../src/services/users', () => ({
  fetchProfiles: jest.fn().mockResolvedValue([])
}))

describe('IssueCard', () => {
  const mockIssue: Issue = {
    id: 'TSK-001',
    title: 'Test Issue',
    type: 'Bug',
    status: 'Todo',
    priority: 'P1',
    sprintId: null,
    assigneeId: null,
    parentId: null,
    description: 'Test description',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  it('should not contain "All Issues" text', () => {
    render(<IssueCard issue={mockIssue} />)
    
    // Check that "All Issues" text is not present
    expect(screen.queryByText('All Issues')).not.toBeInTheDocument()
  })

  it('should render issue title', () => {
    render(<IssueCard issue={mockIssue} />)
    
    // Check that issue title is present
    expect(screen.getByDisplayValue('Test Issue')).toBeInTheDocument()
  })

  it('should render issue ID', () => {
    render(<IssueCard issue={mockIssue} />)
    
    // Check that issue ID is present
    expect(screen.getByText('TSK-001')).toBeInTheDocument()
  })
})
