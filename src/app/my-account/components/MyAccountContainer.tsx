import { authenticateUser, getCustomer, getOrders } from "@/app/service/MyAccountService"
import { redirect } from "next/navigation"
import { MyAccountClient } from "./MyAccountClient"

export async function MyAccountContainer() {
  try {
    const viewer = await authenticateUser()
    const orders = await getOrders(viewer.databaseId)
    const customer = await getCustomer(viewer.databaseId)

    return <MyAccountClient viewer={viewer} orders={orders} posts={viewer.posts.nodes} customer={customer} />
  } catch (error) {
    redirect("/auth/login")
  }
}
