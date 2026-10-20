import { useEffect, useState, type ReactNode } from 'react';
import img1 from '../../assets/backgroundimages/img 1.avif';
import img2 from '../../assets/backgroundimages/img 2.jpg';
import img3 from '../../assets/backgroundimages/img 3.jpg';

const images = [img1, img2, img3];

interface AuthBackdropProps {
  children: ReactNode;
}

// Shared cinematic backdrop for Login/Register: a slowly zooming, crossfading
// image carousel behind a frosted-glass card. `fixed inset-0` (not min-h-screen)
// means this backdrop can never itself cause the document to scroll — any
// overflow on a very short viewport scrolls inside the content pane below
// instead of the page.
export const AuthBackdrop = ({ children }: AuthBackdropProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-950">
      {images.map((image, index) => (
        <div
          key={image}
          className="animate-kenburns absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === activeIndex ? 1 : 0,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
        <h1 className="animate-float-slow animate-gradient-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          Event Management
        </h1>
        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-white/70 sm:text-sm">
          Discover. Book. Experience.
        </p>

        <div className="animate-fade-slide-up mt-5 w-full max-w-md sm:mt-6">{children}</div>
      </div>
    </div>
  );
};
