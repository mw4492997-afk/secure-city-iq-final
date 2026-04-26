import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type LogLevel = "Info" | "Warning" | "Critical" | "Alert";

export async function addAuditLog(
  event: string,
  level: LogLevel = "Info"
): Promise<string> {
  const docRef = await addDoc(collection(db, "audit_logs"), {
    event,
    level,
    location: "Wasit, Iraq",
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

