import {
  authenticateUser,
  getCustomer,
  getOrders,
} from "../service/MyAccountService";
import { redirect } from "next/navigation";
import { MyAccountPage } from "./MyAccountPage";

const MyAccountData = async () => {
  try {
    const viewer = await authenticateUser();
    const orders = await getOrders(viewer.databaseId);
    const customer = await getCustomer(viewer.databaseId);
    // console.log(customer);

    return (
      <MyAccountPage
        viewer={viewer}
        orders={orders}
        posts={viewer.posts.nodes}
        customer={customer}
      />
    );
  } catch (error) {
    redirect("/auth/login");
  }
};

export default MyAccountData;
