import { redirect } from "next/navigation";

export default function HoursRedirect(): never {
  redirect("/admin/contact");
}
