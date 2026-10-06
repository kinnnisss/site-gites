import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo-domaine-lo-carmahon.jpeg";
import { domain } from "@/data/domain";

export function Brand() {
  return (
    <Link
      href="/#accueil"
      aria-label={`${domain.name}, accueil`}
      className="block shrink-0 rounded-md"
    >
      <Image
        src={logo}
        alt={domain.logoAlt}
        sizes="(max-width: 640px) 144px, 184px"
        className="h-auto w-36 object-contain sm:w-46"
      />
    </Link>
  );
}
