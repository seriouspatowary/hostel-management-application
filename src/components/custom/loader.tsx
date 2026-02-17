import React from "react";
import { Loader2 } from "lucide-react"; // Or any icon/spinner you prefer

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full py-10">
      <Loader2 className="animate-spin w-8 h-8 text-[#EF991F]" />
    </div>
  );
};

export default Loader;
