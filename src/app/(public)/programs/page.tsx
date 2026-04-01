import dbConnect from "@/lib/db";
import Program from "@/models/Program";
import ProgramCard from "@/components/public/ProgramCard";
import { IProgram } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  await dbConnect();
  const programs = await Program.find().sort({ order: 1 }).lean();
  const data: IProgram[] = JSON.parse(JSON.stringify(programs));

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Programs</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive educational programs designed for students at every level.
          </p>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((program) => (
              <ProgramCard key={program._id} program={program} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No programs available at the moment.
          </p>
        )}
      </div>
    </div>
  );
}
