"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function usePenalty() {

  const [penaltyAtiva, setPenaltyAtiva] =
    useState<any>(null)

  const [loadingPenalty, setLoadingPenalty] =
    useState(true)

  useEffect(() => {

    async function carregarPenalty() {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoadingPenalty(false)
        return
      }

      const { data: penalty } = await supabase
        .from("user_penalties")
        .select("*")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .or(
          `ends_at.is.null,ends_at.gt.${new Date().toISOString()}`
        )
        .order("created_at", {
          ascending: false,
        })
        .maybeSingle()

      setPenaltyAtiva(penalty)
      setLoadingPenalty(false)
    }

    carregarPenalty()

  }, [])

  return {
    penaltyAtiva,
    loadingPenalty,
  }
}