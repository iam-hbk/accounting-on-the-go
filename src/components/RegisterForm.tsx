"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setSubmitting(true);
    
    try {
      // Create a password-based account which will link to the current anonymous session
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("name", name.trim() || "");
      formData.set("flow", "signUp");

      await signIn("password", formData);
      
      toast.success("Account created successfully! Your anonymous session has been converted to a permanent account.");
      onSuccess?.();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Create Your Account</h2>
        <p className="text-secondary">
          Convert your anonymous session to a permanent account
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-form-field">
        <input
          className="auth-input-field"
          type="text"
          name="name"
          placeholder="Full Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
        
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={submitting}
        />
        
        <input
          className="auth-input-field"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={submitting}
        />
        
        <button 
          className="auth-button" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>
      
      <div className="text-center text-sm text-secondary mt-4">
        <p>
          By creating an account, you'll be able to sign in with your email and password 
          in future sessions while keeping all your current data.
        </p>
      </div>
    </div>
  );
}
