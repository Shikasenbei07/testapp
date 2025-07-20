<<<<<<< HEAD
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../utils/getValidId";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (getValidId()) {
      router.push("/event");
      return;
    }
    router.push("/login");
  }, [router]);
  return null;
=======
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, [router]);
  return null;
>>>>>>> e0b7a348d52970b95ca6fea657eb2169bc1364d3
}