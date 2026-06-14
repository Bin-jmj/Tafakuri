import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/auth/submit-button"
import { signUp } from "@/app/auth/actions"

interface SignUpPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error } = await searchParams

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Jisajili</CardTitle>
          <CardDescription>Fungua akaunti ya Tafakuri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
          )}

          <form action={signUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Jina kamili</Label>
              <Input id="fullName" name="fullName" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Barua pepe</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nenosiri</Label>
              <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
            </div>
            <SubmitButton className="w-full" pendingText="Inajisajili...">Jisajili</SubmitButton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Una akaunti tayari?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Ingia
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
