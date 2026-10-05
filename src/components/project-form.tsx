"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { parseMoney } from "@/lib/money";
const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  currency: z.string().regex(/^[A-Z]{3}$/),
  opening: z.string(),
});
export function ProjectForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "INR", opening: "0" },
  });
  return (
    <form
      className="panel"
      onSubmit={handleSubmit(async (values) => {
        try {
          const { data, error } = await supabaseBrowser().rpc(
            "create_project",
            {
              p_name: values.name,
              p_code: values.code,
              p_currency: values.currency,
              p_opening: parseMoney(values.opening).toString(),
            },
          );
          if (error)
            throw new Error(
              "Unable to create project. Check the fields and your connection.",
            );
          router.push(`/app/projects/${data}`);
          router.refresh();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Unable to create project.",
          );
        }
      })}
    >
      <label>
        Project name
        <input {...register("name")} />
        {errors.name && (
          <small role="alert">Use at least two characters.</small>
        )}
      </label>
      <label>
        Project code
        <input {...register("code")} />
      </label>
      <label>
        Base currency
        <select {...register("currency")}>
          <option>INR</option>
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
        </select>
      </label>
      <label>
        Opening balance
        <input {...register("opening")} inputMode="decimal" />
        <small>Use zero if funding will be entered as separate tranches.</small>
      </label>
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      <Button disabled={isSubmitting}>Create project</Button>
    </form>
  );
}
