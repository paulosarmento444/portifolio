import Header from "@/app/components/Header"
import { MyAccountContainer } from "./components/MyAccountContainer"
import { Toaster } from "@/app/components/toaster"

export default async function MyAccountPage() {
  return (
    <>
      <Header />
      <div className="mt-20">
        <MyAccountContainer />
      </div>
      <Toaster />
    </>
  )
}
