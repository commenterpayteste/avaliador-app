"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type DeviceGroup = {

  fingerprint: string

  users: {

    id: string

    nome: string

    email: string

    whatsapp: string

  }[]

}

export default function AntiFraudePage() {

const [devices, setDevices] =
  useState<DeviceGroup[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    carregarFlags()

  }, [])

  async function carregarFlags() {

    const { data, error } =
      await supabase

        .from("user_devices")

        .select(`

  fingerprint,

  profiles (

    id,
    nome,
    email,
    whatsapp

  )

`)

        .order(
          "created_at",
          { ascending: false }
        )

    console.log(data)
    console.log(error)

    if (data) {
        console.log("DEVICES:", data)
      const grouped = data.reduce((acc: any, item: any) => {

  const fingerprint = item.fingerprint

  if (!acc[fingerprint]) {

    acc[fingerprint] = {

      fingerprint,

      users: []

    }

  }

  acc[fingerprint].users.push(
    item.profiles
  )

  return acc

}, {})

setDevices(
  Object.values(grouped) as any
)
    }

    setLoading(false)
  }

  if (loading) {

    return (

      <div className="text-white p-10">

        Carregando...

      </div>

    )
  }

  return (

    <div className="p-4 space-y-4">

      {devices.map((device) => (

        <div

          key={device.fingerprint}

          className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4"

        >

          <div className="flex items-center justify-between mb-4">

            <p className="text-red-400 font-bold">

              🚨 DEVICE SUSPEITO

            </p>

            <p className="text-yellow-400 text-sm">

              {(() => {

  const total =
    device.users?.length || 0

  if (total >= 4)
    return "🔴 SCORE 100"

  if (total >= 3)
    return "🟠 SCORE 50"

  if (total >= 2)
    return "🟡 SCORE 20"

  return "🟢 SCORE 0"

})()}

            </p>

          </div>

          <div className="space-y-2 text-sm">

  <p className="text-orange-400 text-xs break-all">

    {device.fingerprint}

  </p>

  <div className="pt-4 space-y-3">

  {device.users.map((user) => (

    <div

      key={user.id}

      className="bg-black/40 border border-white/5 rounded-xl p-3"

    >

      <p className="text-white font-semibold">

        {user.nome}

      </p>

      <p className="text-gray-400 text-sm">

        {user.email}

      </p>

      <p className="text-gray-500 text-xs">

        {user.whatsapp}

      </p>

      <p className="text-gray-600 text-[10px] break-all">

        {user.id}

      </p>

    </div>

  ))}

</div>

</div>

        </div>

      ))}

    </div>

  )

}