import Image from "next/image";
import { MedalCalculatorComponent } from "@/components/medal-calculator";

export default function Home() {
  return (
    <main>
      <h1>メダル計算機</h1>
      <MedalCalculatorComponent />
    </main>
  )
}
