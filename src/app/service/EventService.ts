import axios from "axios";

export async function getEvents(): Promise<any> {
  try {
    const response = await axios.get("http://localhost:3001/events");
    const events = response.data;
    return events;
  } catch (error) {
    console.log(error);
  }
}
