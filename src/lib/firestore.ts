import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { AppUser, AnalysisRequest, RequestStatus } from "@/types";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
): Promise<AppUser> {
  const ref = doc(getFirebaseDb(), "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      status: data.status,
      role: data.role ?? "user",
      dailyLimit: data.dailyLimit ?? 3,
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  }

  const newUser: Omit<AppUser, "uid" | "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    email,
    displayName,
    photoURL,
    status: "pending",
    role: "user",
    dailyLimit: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, newUser);

  return {
    uid,
    email,
    displayName,
    photoURL,
    status: "pending",
    role: "user",
    dailyLimit: 3,
    createdAt: null,
    updatedAt: null,
  };
}

export function subscribeToUser(uid: string, callback: (user: AppUser | null) => void) {
  const ref = doc(getFirebaseDb(), "users", uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      status: data.status,
      role: data.role ?? "user",
      dailyLimit: data.dailyLimit ?? 3,
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    });
  });
}

// ---------------------------------------------------------------------------
// Daily usage / quota
// ---------------------------------------------------------------------------

function todayKey(uid: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${uid}_${today}`;
}

export async function getDailyUsage(uid: string): Promise<number> {
  const ref = doc(getFirebaseDb(), "dailyUsage", todayKey(uid));
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  return snap.data().count ?? 0;
}

export async function incrementDailyUsage(uid: string, requestId: string): Promise<void> {
  const key = todayKey(uid);
  const ref = doc(getFirebaseDb(), "dailyUsage", key);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      count: increment(1),
      requests: arrayUnion(requestId),
    });
  } else {
    await setDoc(ref, {
      userId: uid,
      date: new Date().toISOString().slice(0, 10),
      count: 1,
      requests: [requestId],
    });
  }
}

// ---------------------------------------------------------------------------
// Analysis requests
// ---------------------------------------------------------------------------

function parseRequest(id: string, data: Record<string, unknown>): AnalysisRequest {
  return {
    id,
    userId: (data.userId as string) ?? "",
    userEmail: (data.userEmail as string) ?? "",
    ticker: (data.ticker as string) ?? "",
    mode: (data.mode as AnalysisRequest["mode"]) ?? "full_report",
    status: (data.status as RequestStatus) ?? "processing",
    reportUrl: (data.reportUrl as string) ?? null,
    reportFilename: (data.reportFilename as string) ?? null,
    errorDetail: (data.errorDetail as string) ?? null,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? null,
    completedAt: (data.completedAt as Timestamp)?.toDate?.() ?? null,
  };
}

export async function createAnalysisRequest(
  requestId: string,
  userId: string,
  userEmail: string,
  ticker: string,
  mode: string,
): Promise<void> {
  const ref = doc(getFirebaseDb(), "requests", requestId);
  await setDoc(ref, {
    userId,
    userEmail,
    ticker: ticker.toUpperCase(),
    mode,
    status: "processing",
    reportUrl: null,
    reportFilename: null,
    errorDetail: null,
    createdAt: serverTimestamp(),
    completedAt: null,
  });
}

export function subscribeToUserRequests(
  userId: string,
  callback: (requests: AnalysisRequest[]) => void,
) {
  const q = query(
    collection(getFirebaseDb(), "requests"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((d) => parseRequest(d.id, d.data()));
    callback(requests);
  });
}

export function subscribeToAllRequests(callback: (requests: AnalysisRequest[]) => void) {
  const q = query(collection(getFirebaseDb(), "requests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((d) => parseRequest(d.id, d.data()));
    callback(requests);
  });
}
