-- ============================================================
-- Trigger: increment unread count when a guest message arrives
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the trigger function
create or replace function public.handle_new_guest_message()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only increment for guest (or system) messages, not host messages
  if new.sender in ('guest', 'system') then
    update public.conversations
    set
      unread       = true,
      unread_count = unread_count + 1,
      last_message = new.body,
      last_message_at = new.created_at,
      updated_at   = now()
    where id = new.conversation_id;
  end if;

  return new;
end;
$$;

-- 2. Drop the trigger if it already exists (idempotent)
drop trigger if exists on_new_message_update_unread on public.messages;

-- 3. Create the trigger
create trigger on_new_message_update_unread
  after insert on public.messages
  for each row
  execute function public.handle_new_guest_message();
