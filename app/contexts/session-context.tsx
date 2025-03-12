// session-context.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSession } from "@/lib/get-session"; // your session fetching function
import { User } from "@supabase/supabase-js";

interface SessionContextType {
     user: { user: User } | null;
     isLoading: boolean;
     refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
     const [user, setUser] = useState<{ user: User } | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     const refreshSession = async () => {
          setIsLoading(true);
          try {
               const data = await getSession();
               setUser(data ?? null);
          } catch (error) {
               console.error("Error fetching session:", error);
               setUser(null);
          } finally {
               setIsLoading(false);
          }
     };

     // Fetch the session on mount
     useEffect(() => {
          refreshSession();
     }, []);

     return (
          <SessionContext.Provider value={{ user, isLoading, refreshSession }}>
               {children}
          </SessionContext.Provider>
     );
}

export function useSession() {
     const context = useContext(SessionContext);
     if (context === undefined) {
          throw new Error("useSession must be used within a SessionProvider");
     }
     return context;
}
