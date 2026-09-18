"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useMockStore } from "@/lib/mock-store";
import { profileSchema } from "@/lib/validation";

type ProfileFormProps = { onComplete: (destination: "/dashboard") => void };
type ProfileFields = { slug: string; bio: string; dmPrice: string };
type ProfileErrors = Partial<Record<keyof ProfileFields, string>>;

function getErrors(issues: { path: PropertyKey[]; message: string }[]): ProfileErrors {
  return issues.reduce<ProfileErrors>((errors, issue) => {
    const field = issue.path[0];
    if (field === "slug" || field === "bio") errors[field] = issue.message;
    if (field === "dmPrice") errors.dmPrice = "Price must be greater than 0.";
    return errors;
  }, {});
}

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const { saveProfile } = useMockStore();
  const [values, setValues] = useState<ProfileFields>({ slug: "", bio: "", dmPrice: "0" });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof ProfileFields, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(getErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    saveProfile(parsed.data);
    onComplete("/dashboard");
  }

  return (
    <form className="profile-form" onSubmit={submit} noValidate>
      <Field label="Your PaidDM handle" name="slug" autoComplete="username" value={values.slug} onChange={(event) => updateField("slug", event.target.value)} hint="Use 3–20 lowercase letters, numbers, or underscores." error={errors.slug} disabled={isSubmitting} />
      <div className="field">
        <label htmlFor="profile-bio">Short bio</label>
        <textarea id="profile-bio" className="input textarea" name="bio" maxLength={160} value={values.bio} aria-describedby={errors.bio ? "profile-bio-error" : undefined} aria-invalid={Boolean(errors.bio) || undefined} onChange={(event) => updateField("bio", event.target.value)} disabled={isSubmitting} />
        {errors.bio ? <p id="profile-bio-error" className="field-error" role="alert">{errors.bio}</p> : null}
      </div>
      <Field label="Price per message" name="dmPrice" type="number" min="0.01" step="0.01" inputMode="decimal" value={values.dmPrice} onChange={(event) => updateField("dmPrice", event.target.value)} hint="USDC on Robinhood Chain Testnet (simulated)." error={errors.dmPrice} disabled={isSubmitting} />
      <Button type="submit" className="button-wide" disabled={isSubmitting}>{isSubmitting ? "Saving profile…" : "Save profile"}</Button>
    </form>
  );
}
