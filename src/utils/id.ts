const pad3 = (n: number) => n.toString().padStart(3, '0');

export const nextIssueId = (counter: number) => `TSK-${pad3(counter)}`;
export const nextSprintId = (counter: number) => `SPR-${pad3(counter)}`;













