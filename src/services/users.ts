import { supabase } from "@/lib/supabase"

export type Profile = { id: string; username: string | null; email: string | null }

export async function fetchProfiles(): Promise<Profile[]> {
  console.log('Fetching profiles from Supabase...');
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,email")
    .order("username", { nullsFirst: false });
  
  if (error) { 
    console.error('Error fetching profiles:', error); 
    return [] 
  }
  
  console.log('Profiles fetched successfully:', data);
  return data || []
}

