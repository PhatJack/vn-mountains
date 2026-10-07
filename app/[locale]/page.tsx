import { getMountainsData } from "@/services/api/mountains/mountains.server";
import HomePage from "@/app/_components/home-page";

export default async function Home() {
  const initialData = await getMountainsData();
  return <HomePage initialData={initialData} />;
}
