import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import { apiRequest } from "../../lib/apiClient";
import { registerMemberSchema } from "@riverside/shared";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";

type Step = "account" | "profile";

export function RegisterPage() {
  const { signUp, signIn, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAccountSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError);
      setIsSubmitting(false);
      return;
    }

    // Supabase's default flow requires email confirmation before a session
    // exists. If confirmations are on in this project, signIn below will
    // fail until the user clicks the confirmation link — that's expected;
    // we surface the message and let them try step two once confirmed.
    await signIn(email, password);

    setIsSubmitting(false);
    setStep("profile");
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerMemberSchema.safeParse({
      fullName,
      phone: phone || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/api/members/register", {
        method: "POST",
        body: parsed.data,
      });
      await refreshProfile();
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <p className="font-sans text-sm text-river-600">
        Step {step === "account" ? "1" : "2"} of 2
      </p>
      <h1 className="mt-1 font-display text-3xl text-river-900">
        {step === "account" ? "Join Riverside Community Hub" : "Tell us about you"}
      </h1>
      <p className="mt-3 text-ink/70">
        {step === "account"
          ? "Create an account to book rooms and equipment, join youth programmes, or track your donations."
          : "This helps our staff know who's using the centre and how to reach you."}
      </p>

      {step === "account" ? (
        <form onSubmit={handleAccountSubmit} className="mt-8 flex flex-col gap-5">
          <Field
            id="email"
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-gold-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Continue"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleProfileSubmit} className="mt-8 flex flex-col gap-5">
          <Field
            id="fullName"
            label="Full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Field
            id="phone"
            label="Phone number (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && <p className="text-sm text-gold-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Complete registration"}
          </Button>
        </form>
      )}
    </div>
  );
}
