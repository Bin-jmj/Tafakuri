import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/auth/submit-button"
import { signInWithPassword, signInWithGoogle } from "@/app/auth/actions"

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next = "/" } = await searchParams

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Ingia</CardTitle>
          <CardDescription>Ingia kwenye akaunti yako ya Tafakuri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
          )}

          <form action={signInWithPassword} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-2">
              <Label htmlFor="email">Barua pepe</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nenosiri</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <SubmitButton className="w-full" pendingText="Inaingia...">Ingia</SubmitButton>
          </form>

          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <SubmitButton variant="outline" className="w-full" pendingText="Inaingia...">
              Ingia na Google
            </SubmitButton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Huna akaunti?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Jisajili
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
