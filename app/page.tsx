import { getMountainsData } from "@/services/api/mountains/mountains.server";
import HomePage from "./_components/HomePage";

export default async function Home() {
  const initialData = await getMountainsData();
  return <HomePage initialData={initialData} />;
}