import Image from "next/image";
import { IProgram } from "@/types";

interface ProgramCardProps {
  program: IProgram;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={program.imageUrl}
          alt={program.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {program.description}
        </p>
      </div>
    </div>
  );
}
