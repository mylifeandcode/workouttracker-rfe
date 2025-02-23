import Image from "next/image";
import styles from "./page.module.css";
import RequireAuth from "@/app/context/RequireAuth";
import Nav from "./ui/nav";
import UserOverview from "./ui/home/user-overview";
import QuickActions from "./ui/home/quick-actions";

export default function Home() {
  return (
    <RequireAuth>
      <h3 className="m-2">
        Welcome to Workout Tracker
      </h3>
      <main className={styles.main}>
        <div className="flex-1">
          <UserOverview />
        </div>
        <div className="flex-1">
          <QuickActions />
        </div>
      </main>
    </RequireAuth>
  );
}
