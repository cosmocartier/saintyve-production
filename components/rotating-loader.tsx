"use client"

export function RotatingLoader() {
  return (
    <>
      <style jsx>{`
        @keyframes sk-rotateplane {
          0% {
            transform: perspective(120px) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
          }
          100% {
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
          }
        }

        .rotating-plane {
          animation: sk-rotateplane 1.2s infinite ease-in-out;
        }
      `}</style>
      <div className="rotating-plane w-10 h-10 bg-black" />
    </>
  )
}
