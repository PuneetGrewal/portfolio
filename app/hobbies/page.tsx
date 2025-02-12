import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Maximize2 } from "lucide-react"


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
              <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
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
  
        {/* Photography Section */}
      {/* Photography Section */}
      <section>
          <h2 className="text-2xl font-semibold mb-6">Photography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src="/images/nature1.jpg"
                alt="Nature scenery 1"
                width={3024}
                height={4032}
                className="object-cover w-full h-64"
                priority
              />
            </div>
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src="/images/nature2.jpg"
                alt="Nature scenery 2"
                width={3024}
                height={4032}
                className="object-cover w-full h-64"
                priority
              />
            </div>
          </div>
        </section>
      </div>
    )
  }