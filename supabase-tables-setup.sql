-- Create issues table
create table if not exists public.issues (
  id text primary key,
  title text not null,
  type text not null check (type in ('Bug', 'Task', 'Feature', 'Story')),
  status text not null check (status in ('Todo', 'In Progress', 'In Review', 'Done')),
  priority text not null check (priority in ('P0', 'P1', 'P2', 'P3', 'P4', 'P5')),
  sprint_id text references public.sprints(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  parent_id text references public.issues(id) on delete set null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- Create sprints table
create table if not exists public.sprints (
  id text primary key,
  name text not null,
  status text not null check (status in ('Planned', 'Active', 'Completed')),
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS
alter table public.issues enable row level security;
alter table public.sprints enable row level security;

-- RLS Policies for issues
create policy "issues are readable by everyone"
on public.issues for select
to anon, authenticated
using (true);

create policy "authenticated users can insert issues"
on public.issues for insert
to authenticated
with check (true);

create policy "authenticated users can update issues"
on public.issues for update
to authenticated
using (true);

create policy "authenticated users can delete issues"
on public.issues for delete
to authenticated
using (true);

-- RLS Policies for sprints
create policy "sprints are readable by everyone"
on public.sprints for select
to anon, authenticated
using (true);

create policy "authenticated users can insert sprints"
on public.sprints for insert
to authenticated
with check (true);

create policy "authenticated users can update sprints"
on public.sprints for update
to authenticated
using (true);

create policy "authenticated users can delete sprints"
on public.sprints for delete
to authenticated
using (true);

-- Create indexes for better performance
create index if not exists idx_issues_sprint_id on public.issues(sprint_id);
create index if not exists idx_issues_assignee_id on public.issues(assignee_id);
create index if not exists idx_issues_parent_id on public.issues(parent_id);
create index if not exists idx_issues_status on public.issues(status);
create index if not exists idx_issues_priority on public.issues(priority);
create index if not exists idx_sprints_status on public.sprints(status);

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers to automatically update updated_at
create trigger update_issues_updated_at
  before update on public.issues
  for each row
  execute function update_updated_at_column();

create trigger update_sprints_updated_at
  before update on public.sprints
  for each row
  execute function update_updated_at_column();
