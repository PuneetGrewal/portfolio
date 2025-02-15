import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Maximize2 } from "lucide-react"
import { PhotoItem } from "@/components/photoitem"; // Adjust the import path as needed
import { VideoItem } from '@/components/videoitem'; // Adjust path as needed
import { MountainItem } from '@/components/mountains';

const photos = [
  { src: "/images/nature1.jpg", caption: "Coastal Rennaisance", location: "Lion's Bay, BC, Canada" },
  { src: "/images/nature2.jpg", caption: "Solo Paddleboarder", location: "Malahat Pass, BC, Canada" },
  { src: "/images/nature3.jpg", caption: "Caves", location: "Dead Man's Flats, AB, Canada" },
  { src: "/images/nature4.jpg", caption: "Ferry Emerging", location: "Vancouver, BC, Canada" },
]

const mountains = [
  { name: "Mt. Brunswick", location: "North Shore, BC", altitude: "1788 m", image: "/mountains/brunswick.jpg" },
  { name: "Ha Ling Peak", location: "Kananaskis Country, Alberta", altitude: "2407 m", image: "/mountains/haling.jpg" },
  { name: "Mt. Harvey", location: "North Shore, BC", altitude: "1652 m", image: "/mountains/harvey.jpg" },
  {name: "Pump Peak", location: "Vancouver, BC", altitude: "1449 m", image: "/mountains/seymour.jpg" }
]

export const metadata = {
  title: "Hobbies",
  description: "Here are things I do in my free time.",
};

export default function Hobbies() {
  return (
    <div className="min-h-screen px-8 py-12">
      <h1 className="text-4xl font-bold mb-6">My Hobbies</h1>
      
      {/* Tennis Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Tennis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VideoItem 
            src="/videos/tennis1.mp4"
            title="Tennis Video 1"
          />
          <VideoItem 
            src="/videos/tennis2.mp4"
            title="Tennis Video 2"
          />
        </div>
      </section>

      {/* Photography Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Photography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {photos.map((photo, index) => (
            <PhotoItem key={index} photo={photo} />
          ))}
        </div>
      </section>

      {/* Hiking Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Hiking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mountains.map((mountain, index) => (
            <MountainItem key={index} mountain={mountain} />
          ))}
        </div>
      </section>

    </div>
  );
}
