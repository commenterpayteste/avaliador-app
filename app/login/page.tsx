"use client"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push("/dashboard")
      }
    }

    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push("/dashboard")
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] flex flex-col items-center justify-between py-10 px-6 text-white">

      {/* LOGO */}
      <div className="text-center space-y-2">
        <img
          src="/icons/commenter1.png"
          alt="Commenter Pay"
          className="h-20 mx-auto object-contain"
        />

        <p className="text-gray-300 text-sm">
          Faça login para continuar
        </p>
      </div>

      {/* CARD CENTRAL */}
      <div className="w-full max-w-sm bg-black rounded-3xl p-6 flex flex-col items-center justify-center flex-1 my-10 space-y-6">

        <p className="text-gray-300 text-center text-sm">
          Você está a poucos segundos de começar a ganhar avaliando empresas.
        </p>

        <button
          onClick={login}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition"
        >
          <img
            src="/icons/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Entrar com Google
        </button>

        <p className="text-xs text-gray-500 text-center">
          Login rápido e seguro. Não postamos nada por você.
        </p>
      </div>

      {/* RODAPÉ */}
      <p className="text-xs text-gray-500">
        © {new Date().getFullYear()} Commenter Pay
      </p>
    </div>
  )
}
