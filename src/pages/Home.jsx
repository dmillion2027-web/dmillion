import { Hero } from '../components/sections/Hero';
import { Collection } from '../components/sections/Collection';
import { Features } from '../components/sections/Features';
import { Newsletter } from '../components/sections/Newsletter';

export function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Collection />
      <Features />
      <Newsletter />
    </div>
  );
}
