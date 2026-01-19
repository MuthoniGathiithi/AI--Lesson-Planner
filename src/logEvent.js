import { supabase } from "./supabaseClient";

// Generate a unique session ID per visitor
function getSessionId() {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

// Main function to log events
export async function logEvent(action, meta = {}, status = "success") {
  const session_id = getSessionId();

  const { error } = await supabase.from("event_logs").insert([
    {
      session_id,
      action,
      meta,
      status,
    },
  ]);

  if (error) console.error("Logging failed:", error);
}
