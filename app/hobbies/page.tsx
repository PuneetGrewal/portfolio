import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Maximize2 } from "lucide-react"
import { PhotoItem } from "@/components/photoitem" ; // Adjust the import path as needed


const photos = [
  { src: "/images/nature1.jpg", caption: "Coastal Rennaisance", location: "Lion's Bay, BC, Canada" },
  { src: "/images/nature2.jpg", caption: "Solo Paddleboarder", location: "Malahat Pass, BC, Canada" },
  { src: "/images/nature3.jpg", caption: "Caves", location: "Dead Man's Flats, AB, Canada" },
  { src: "/images/nature4.jpg", caption: "Ferry Emerging", location: "Vancouver, BC, Canada" },
]

export const metadata = {
  title: "Hobbies",
  description: "Here are things I do in my free time.",
};

export default function Hobbies() {
    return (
      <div className="min-h-screen p-24">
        <h1 className="text-4xl font-bold mb-8">My Hobbies</h1>
        
        {/* Tennis Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Tennis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Tennis Video */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer ">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  src="/videos/tennis1.mp4"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
            <DialogTitle>Tennis Video 1</DialogTitle>
              <video
                controls
                autoPlay
                className="w-full aspect-video rounded-lg"
                src="/videos/tennis1.mp4"
              />
            </DialogContent>
          </Dialog>

          {/* Second Tennis Video */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  src="/videos/tennis2.mp4"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 ">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
            <DialogTitle>Tennis Video 2</DialogTitle>
              <video
                controls
                autoPlay
                className="w-full aspect-video rounded-lg"
                src="/videos/tennis2.mp4"
              />
            </DialogContent>
          </Dialog>
        </div>
      </section>
  
       
                {/* <section>
                  <h2 className="text-2xl font-semibold mb-6">Photography</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg group">
                        <div 
                          className="cursor-pointer transition-all duration-300 transform hover:scale-105 focus:scale-125"
                          tabIndex={0}
                          onClick={(e) => e.currentTarget.classList.toggle('scale-125')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.currentTarget.classList.toggle('scale-125');
                            }
                          }}
                        >
                          <Image
                            src={photo.src || "/placeholder.svg"}
                            alt={photo.caption}
                            width={3024}
                            height={4032}
                            className="object-cover w-full h-64 rounded-lg"
                            priority
                          />
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-end p-4 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100">
                            <p className="text-white text-sm font-semibold">{photo.caption}</p>
                            <p className="text-white text-xs">{photo.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section> */}


                 {/* Photography Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Photography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photos.map((photo, index) => (
                <PhotoItem key={index} photo={photo} />
              ))}
            </div>
          </section>

              

      </div>
    )
  }