// SignInForm.js
import { cn } from "../../../lib/utils.js";
import { Button } from "../../../components/ui/button.jsx";
import { Input } from "../../../components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "../../../routes/common/routePath.js";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useLoginMutation } from "../../../features/auth/authAPI.js";
import { useAppDispatch } from "../../../app/hooks.js";
import { setCredentials } from "../../../features/auth/authSlice.js";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInForm({ className, ...props }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values) => {
    login(values)
      .unwrap()
      .then((data) => {
        //  console.log("Login Data",data)
        dispatch(setCredentials(data));
        toast.success("Login successful");
        console.log("Navigation",PROTECTED_ROUTES.OVERVIEW)
        setTimeout(() => navigate(PROTECTED_ROUTES.OVERVIEW), 1000);
   
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.data?.message || "Failed to login");
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-normal">Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-normal">Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            Login
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-[var(--bg-color)] dark:bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>

        
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to={AUTH_ROUTES.SIGN_UP} className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
