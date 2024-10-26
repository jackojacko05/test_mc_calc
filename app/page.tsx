import { MedalCalculatorComponent } from "@/components/medal-calculator";

export default function Home() {
  return (
    <main className="h-screen">
      <div className="text-center py-8 bg-black">
        <h1 className="text-4xl font-bold text-[#d4af37] twisted-wonderland-font">
          マスターシェフ 料理シミュレーター
        </h1>
        <h2 className="text-2xl font-bold text-[#d4af37] twisted-wonderland-font mt-2">
          for ツイステッドワンダーランド(ツイステ)
        </h2>
      </div>
      <MedalCalculatorComponent />
    </main>
  )
}
