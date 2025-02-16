import Image from "next/image";
import styles from "./page.module.css";
import RequireAuth from "@/app/context/RequireAuth";
import Nav from "./ui/nav";
import Layout from "./layout";

export default function Home() {
  return (
    <RequireAuth>
      <Layout>
        <Nav />
        <main className={styles.main}>
          <div className="flex flex-row">
            <div>
              Workout Tracker
            </div>
          </div>
        </main>
      </Layout>
    </RequireAuth>
  );
}
