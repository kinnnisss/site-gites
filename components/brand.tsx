import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo-domaine-lo-carmalhon.jpeg";
import { domain } from "@/data/domain";

export function Brand() {
  const [firstWord, ...rest] = domain.name.split(" ");
  return (
    <Link
      href="/#accueil"
      aria-label={`${domain.name}, accueil`}
      className="brand"
    >
      <Image
        src={logo}
        alt=""
        sizes="76px"
        className="h-auto w-[76px] object-contain"
      />
      <span>
        <span className="block font-serif text-[21px] leading-[1.05]">
          {firstWord}
          <br />
          {rest.join(" ")}
        </span>
        <span className="mt-1.5 block text-[8px] uppercase tracking-[0.18em] text-muted">
          Saint-Aulaye · Dordogne
        </span>
      </span>
    </Link>
  );
}
