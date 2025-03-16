import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePaths";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useStore } from "@/store/store";
import { useMutation } from "@tanstack/react-query";
import { loginMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const { setUser, setAccessToken, setExpiresAt } = useStore();

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignInFormValues) => {
    console.log("Form values:", values);
    if (isPending) return;

    mutate(values, {
      onSuccess: (data) => {
        const user = data.user;
        const accessToken = data.accessToken;
        const expiresAt = data.expiresAt;

        setUser(user);
        setAccessToken(accessToken);
        setExpiresAt(expiresAt);
        toast.success("Login successfully");

        navigate(PROTECTED_ROUTES.EVENT_TYPES);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || "Failed to login");
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* { Top Header} */}
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div
                className="flex aspect-square size-8 items-center 
          justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <Command className="size-5" />
              </div>
              <span className="sr-only">Meetly</span>
            </Link>
            <h2 className="text-xl font-bold text-[#0a2540]">
              Log into your Meetly account
            </h2>
          </div>

          {/* {Form Card} */}
          <div
            className="w-full bg-white flex flex-col gap-5 rounded-[6px] p-[38px_25px]"
            style={{
              boxShadow: "rgba(0, 74, 116, 0.15) 0px 1px 5px",
              border: "1px solid #d4e0ed",
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-semibold !text-sm">
                      Email address
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="subcribeto@techwithemma.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-semibold !text-sm">Password</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="***********"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? <Loader color="white" /> : "Login"}
              </Button>
            </div>

            {/* {OR} */}

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>

            <div className="grid gap-1 sm:grid-cols-1 -mt-3">
              <Button variant="outline" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to={AUTH_ROUTES.SIGN_UP}
                className="underline underline-offset-4 text-primary"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </Form>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
