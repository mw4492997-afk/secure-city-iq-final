import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface AuditLogPayload {
  event: string;
  level: "Info" | "Warning" | "Critical" | "Alert";
  source: string;
}

export async function addAuditLog(
  event: string,
  level: AuditLogPayload["level"] = "Info",
  source: string = "Secure City IQ"
): Promise<string> {
  const docRef = await addDoc(collection(db, "audit_logs"), {
    event,
    level,
    source,
    location: "Wasit, Iraq",
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

