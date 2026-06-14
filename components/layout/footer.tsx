import Image from "next/image"
import Link from "next/link"
import { Heart, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Tafakuri" width={32} height={32} className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-lg">Tafakuri</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Programu ya kusambaza maarifa ya Kiislamu kwa Kiswahili. Soma Qur'ani, Hadith, na Dua za kila siku.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Viungo vya Haraka</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Nyumbani
                </Link>
              </li>
              <li>
                <Link href="/quran" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Qur'ani Tukufu
                </Link>
              </li>
              <li>
                <Link href="/hadith" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hadith
                </Link>
              </li>
              <li>
                <Link href="/dua" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dua na Adhkar
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Makala
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Rasilimali</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kuhusu Sisi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Wasiliana Nasi
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sera ya Faragha
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Masharti ya Matumizi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Maswali Yanayoulizwa Mara kwa Mara
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Wasiliana</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:tafakuriapp@gmail.com" className="hover:text-primary transition-colors">
                  tafakuriapp@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a
                  href="https://wa.me/255629575812"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  +255 629 575 812
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>Tengenezwa kwa upendo kwa Umma wa Kiislamu</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Tafakuri. Haki zote zimehifadhiwa.</p>
          <p className="text-center sm:text-right">Mradi huria (open source) kwa Umma wa Kiislamu</p>
        </div>
      </div>
    </footer>
  )
}
