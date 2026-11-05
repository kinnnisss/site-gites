import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { House, Amenities } from "@/components/sections/house";
import { Outdoors, Equestrian } from "@/components/sections/outdoors";
import { Gallery } from "@/components/sections/gallery";
import {
  PracticalInfo,
  Contact,
} from "@/components/sections/practical-contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <House />
      <Amenities />
      <Outdoors />
      <Equestrian />
      <Gallery />
      <PracticalInfo />
      <Contact />
    </>
  );
}
