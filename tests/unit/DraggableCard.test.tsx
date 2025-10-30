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

describe('DraggableCard', () => {
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

  it('should not contain "All Issues" text', () => {
    render(
      <DndContext>
        <KanbanBoard issues={mockIssues} sprintName="Test Sprint" />
      </DndContext>
    )
    
    // Check that "All Issues" text is not present
    expect(screen.queryByText('All Issues')).not.toBeInTheDocument()
  })

  it('should render issue title', () => {
    render(
      <DndContext>
        <KanbanBoard issues={mockIssues} sprintName="Test Sprint" />
      </DndContext>
    )
    
    // Check that issue title is present
    expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
  })

  it('should render issue ID', () => {
    render(
      <DndContext>
        <KanbanBoard issues={mockIssues} sprintName="Test Sprint" />
      </DndContext>
    )
    
    // Check that issue ID is present
    expect(screen.getByText('TSK-001')).toBeInTheDocument()
  })
})
