import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type BFUserRole = "florist" | "org_admin" | "org_member" | "customer" | null;

interface BFUserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  organization_id: string | null;
}

interface BloomFundrAuthContextType {
  user: User | null;
  session: Session | null;
  profile: BFUserProfile | null;
  role: BFUserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "florist" | "org_admin") => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const BloomFundrAuthContext = createContext<BloomFundrAuthContextType | undefined>(undefined);

export const BloomFundrAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<BFUserProfile | null>(null);
  const [role, setRole] = useState<BFUserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("bf_user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as BFUserProfile);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from("bf_user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleData) {
        setRole(roleData.role as BFUserRole);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer data fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userRole: "florist" | "org_admin"
  ): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/fundraiser`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            bf_role: userRole,
          },
        },
      });

      if (signUpError) {
        return { error: signUpError };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("bf_user_profiles")
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            email: email,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        // Create role
        const { error: roleError } = await supabase
          .from("bf_user_roles")
          .insert({
            user_id: data.user.id,
            role: userRole,
          });

        if (roleError) {
          console.error("Role creation error:", roleError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <BloomFundrAuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </BloomFundrAuthContext.Provider>
  );
};

export const useBloomFundrAuth = () => {
  const context = useContext(BloomFundrAuthContext);
  if (context === undefined) {
    throw new Error("useBloomFundrAuth must be used within a BloomFundrAuthProvider");
  }
  return context;
};
