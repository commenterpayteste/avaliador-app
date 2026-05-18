import { supabase } from "@/lib/supabaseClient"
import { getDeviceFingerprint } from "@/lib/fingerprint"

export async function saveDevice() {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const fingerprint =
    await getDeviceFingerprint()

  const userAgent =
    navigator.userAgent

  const { data: existing } =
    await supabase
      .from("user_devices")
      .select("id")
      .eq("user_id", user.id)
      .eq("fingerprint", fingerprint)
      .maybeSingle()

  // evita duplicar mesmo device
  if (existing) return

  await supabase
    .from("user_devices")
    .insert({

      user_id: user.id,

      fingerprint,

      user_agent: userAgent,

    })
}