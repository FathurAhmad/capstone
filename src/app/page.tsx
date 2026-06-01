import { redirect } from "next/navigation";

export default function Home() {
  // Automatically redirect anyone who visits the root page to the login page.
  redirect("/login");
}
