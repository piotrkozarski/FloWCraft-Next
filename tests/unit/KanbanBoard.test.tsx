import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import KanbanBoard from '../../src/components/KanbanBoard'
import type { Issue } from '../../src/types'

// Mock the store
jest.mock('../../src/store', () => ({
  useFCStore: () => ({
    moveIssueStatus: jest.fn(),
    sprints: [],
    issues: []
  })
}))

// Mock the services
jest.mock('../../src/services/users', () => ({
  fetchProfiles: jest.fn().mockResolvedValue([])
}))

// Mock the telemetry
jest.mock('../../src/utils/telemetry', () => ({
  logEvent: jest.fn()
}))

// Mock the debounce hook
jest.mock('../../src/utils/debounce', () => ({
  useDebounce: (value: any) => value
}))

// Mock the filters
jest.mock('../../src/utils/filters', () => ({
  applyFilters: (issues: Issue[]) => issues,
  hasActiveFilters: () => false,
  clearFilters: () => ({ title: '', assigneeId: '', priority: '' })
}))

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}))

describe('KanbanBoard', () => {
  const mockIssues: Issue[] = [
    {
      id: 'TSK-001',
      title: 'Test Issue 1',
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
  ]

  it('should not contain section header text', () => {
    render(
      <DndContext>
        <KanbanBoard issues={mockIssues} sprintName="Test Sprint" />
      </DndContext>
    )
    
    // Check that section header texts are not present
    expect(screen.queryByText('All Issues')).not.toBeInTheDocument()
    expect(screen.queryByText('Current Sprint')).not.toBeInTheDocument()
    expect(screen.queryByText('Kanban Board')).not.toBeInTheDocument()
  })

  it('should render only filters and kanban columns', () => {
    render(
      <DndContext>
        <KanbanBoard issues={mockIssues} sprintName="Test Sprint" />
      </DndContext>
    )
    
    // Check that filters are present
    expect(screen.getByPlaceholderText('Search title...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter assignee...')).toBeInTheDocument()
    
    // Check that issue count is present
    expect(screen.getByTestId('issue-count')).toBeInTheDocument()
    
    // Check that kanban columns are present
    expect(screen.getByTestId('column-TODO')).toBeInTheDocument()
    expect(screen.getByTestId('column-IN_PROGRESS')).toBeInTheDocument()
    expect(screen.getByTestId('column-IN_REVIEW')).toBeInTheDocument()
    expect(screen.getByTestId('column-DONE')).toBeInTheDocument()
  })
})
